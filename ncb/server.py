from __future__ import unicode_literals, print_function
from flask import Flask, request, jsonify, send_from_directory, session, make_response

from socket import *

from db import MongoSessionInterface, MongoAuthenticator

import json, os, time, threading, struct, random, datetime
import pika

DAEMON_CONNECTED = True
DAEMON_HOST = '10.0.1.40'

# Create new application
app = Flask(__name__, static_url_path='', static_folder='')
app.session_interface = MongoSessionInterface(db='testdb')
#sslify = SSLify(app)
# Debugging is okay for now
app.debug = True

daemon_connections = {}
# authDB = AuthenticationDB('TestDB')
# authDB.add_user('admin', 'test')
report_data = {}

# set upload folder and allowed extensions
allowedFileExtensions = set(['json','py'])

# register upload folder with flask app
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['EXPORT_FOLDER'] = 'exports'

if not os.path.exists(app.config['EXPORT_FOLDER']):
    os.makedirs(app.config['EXPORT_FOLDER'])

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


importFile = 'import'
importFilePath = os.path.join(app.config['UPLOAD_FOLDER'], importFile)

def update_JSON(jsonObj):
    changeAllKeys(jsonObj, u'baseCellGroups', u'groups')
    changeAllKeys(jsonObj, u'cellGroups', u'groups')
    changeAllKeys(jsonObj, u'cellAliases', u'neuron_aliases')
    changeAllKeys(jsonObj, u'name', u'entity_name')
    changeAllKeys(jsonObj, u'type', u'entity_type')

# changes old key names to new key names
def changeAllKeys(obj, oldKey, newKey):
    if not isinstance(obj, dict):
        return

    for key in obj:
        if key == oldKey:
            obj[newKey] = obj.pop(oldKey)
            key = newKey

        if isinstance(obj[key], dict):
            changeAllKeys(obj[key], oldKey, newKey)

        elif isinstance(obj[key], list):
            for element in obj[key]:
                changeAllKeys(element, oldKey, newKey)

# load json file
def loadJSONFile(fileName):
    try:
        with open(fileName) as fin:
            jsonObj = json.load(fin)

    except IOError:
        print("Error: %s not found." % (fileName,))
        return {'success': False}

    changeAllKeys(jsonObj, u'groups', u'cellGroups')
    changeAllKeys(jsonObj, u'neuron_aliases', u'cellAliases')
    changeAllKeys(jsonObj, u'entity_name', u'name')
    changeAllKeys(jsonObj, u'entity_type', u'type')

    return jsonObj

# saves json to file
def saveJSONFile(fileName, JSON):
    #update_JSON(JSON)

    with open(fileName, 'w') as fout:
        json.dump(JSON, fout, indent=4)

message_queues = {}
#initiates transfer to ncs

@app.route('/get-report-specs', methods=['GET'])
def get_report_specs():
    if request.method == 'GET':
        username = get_username()

        if username in report_data:
            obj = {
                'success' : True,
                'simulations' : report_data[username]
            }

            print('specs', file=sys.stderr)
            print(obj, file=sys.stderr)
            return jsonify(obj)

        jsonify({'success' : False, 'reason' : 'user not found in report_data'})

    return jsonify({'success' : False, 'reason' : 'wrong method'})

@app.route('/transfer', methods=['POST'])
def transferData():
    if request.method == 'POST':
        # jsonObj now has simulation parameters and model

        # with open('/Users/cam/Desktop/ncb/ncb/test.json') as fin:
        #     content = fin.read()

        jsonObj = request.get_json(False, False, False)

        jsonObj['request'] = 'launchSim'

        print('Model:', file=sys.stderr)
        print(json.dumps(jsonObj, indent=3), file=sys.stderr)

        # create message queue
        username = request.cookies.get('username')

        if not username:
            raise Exception('User not logged in!')

        reports = jsonObj['simulation']['outputs']

        report_objects = []
        sim_name = jsonObj['simulation']['name']

        if username not in report_data:
            report_data[username] = []

        obj = {'name' : sim_name, 'reports' : report_objects}
        found = False
        for sim in report_data[username]:
            if sim['name'] == sim_name:
                found = True
                break

        if not found:
            report_data[username].append(obj)

        for report in reports:
            if not found:
                report_objects.append({
                    'name' : report['name'],
                    'data' : []
                })

            t = threading.Thread(target=createRabbitMQConnection, args=(jsonObj, username, report))
            t.daemon = True
            t.start()

        print('Report Data', file=sys.stderr)
        print(report_data, file=sys.stderr)

        daemon_response = send_request_to_daemon(jsonObj)

        if is_response_successful(daemon_response):
            return jsonify({'success': True})

        elif 'reason' in daemon_response:
            return jsonify({'success' : False, 'reason' : daemon_response['reason']})

    return jsonify({'success': False})

if DAEMON_CONNECTED:
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=DAEMON_HOST,
                                                                   port=5672,
                                                                   credentials=pika.PlainCredentials('test', 'test')))

def createRabbitMQConnection(jsonObj, username, report):
    channel = connection.channel()

    channel.queue_declare(queue='data', durable=True, exclusive=False, auto_delete=False)
    channel.exchange_declare(exchange='datastream', type='direct', durable=True, auto_delete=False)

    print(report, file=sys.stderr)
    routing_key = '%s..%s' % (username, report['name'])

    print('routing key: ' + routing_key, file=sys.stderr)
    channel.queue_bind(queue='data', exchange='datastream', routing_key=routing_key)

    def rabbit_callback(ch, method, properties, body):
        #while True:
            #msg = queue.get()
        print('Received: ' + body, file=sys.stderr)
        if body == 'STOP':
            ch.close()

    channel.basic_consume(rabbit_callback, queue='data', no_ack=True, consumer_tag='testtag')

    #queue = connection.queue('testtag')

    print('Created RabbitMQ Channel', file=sys.stderr)

    channel.start_consuming()

# initiates export
@app.route('/export-json', methods=['POST', 'GET'])
def export_json():
    global exportFile
    if request.method == 'POST':
        jsonObj = request.get_json(False, False, False)
        fileName = jsonObj['model']['name'] + '.json'
        filePath = os.path.join(app.config['EXPORT_FOLDER'], fileName)
        saveJSONFile(filePath, jsonObj)

        exportFile = fileName
        return send_from_directory(app.config['EXPORT_FOLDER'], fileName, as_attachment = True)
    elif request.method == 'GET':
        return send_from_directory(app.config['EXPORT_FOLDER'], exportFile, as_attachment = True)


    return jsonify({"success": False})

@app.route('/import', methods=['POST', 'GET'])
def importFile():
    if request.method == 'POST':
        #print ("files: %r" %(request.files))
        webFile = request.files['import-file'];
        # if file exists and is allowed extension
        if webFile:
            if '.py' in webFile.filename:
                print('Python Import!', file=sys.stderr)
                webFile.save(importFilePath + '.py')

                with open(importFilePath + '.py') as fin:
                    scriptContents = fin.read()

                daemon_request = {'request' : 'scriptToJSON', 'script' : scriptContents}

                daemon_response = send_request_to_daemon(daemon_request)

                if is_response_successful(daemon_response):
                    daemon_response['success'] = True
                    return jsonify(daemon_response)

                else:
                    return jsonify({'success' : False, 'reason' : daemon_response['reason']})

            else:
                print('JSON Import!', file=sys.stderr)
                jsonObj = loadJSONFile(importFilePath)

                return jsonify(jsonObj)

    elif request.method == 'GET':
        jsonObj = loadJSONFile(importFile)
        return jsonify(jsonObj)

    return jsonify({'success': False, 'reason' : 'Non GET or POST'})


@app.route('/')
# @authDB.requires_auth
def index_route():
    username = request.cookies.get('username')

    if username:
        return app.send_static_file('index.html')

    else:
        delete_session()
        return app.send_static_file('login.html')


# Serves static resources like index.html, css, js, images, etc.
@app.route('/assets/<path:resource>')
def serve_static_resource(resource):
    # Return the static file
    return send_from_directory('static/assets/', resource)

reports = []
#fileIn = open('reg_voltage_report.txt')
logfile = open('log.txt', 'w')

@app.route('/report-<slug>')
def transfer_report(slug):
    print('Called')
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        reports.append({"number": int(slug), "socket": ws})
        logfile.write(str(dir(ws)) + '\n')
        message = ws.receive()
        oldTime = time.time()

        # receive the output data from the daemon
        dataSocket = socket(AF_INET, SOCK_STREAM)
        host = gethostbyname(gethostname())
        try:
            dataSocket.connect((host,10000))
            print ('Established connection with the daemon')
        except Exception, e:
            print ("Error with daemon socket. Exception type is", str(e))

        count = 0;

        while True:

            # receive the message length
            sizeStr = (dataSocket.recvfrom(1))[0]
            if not sizeStr:
                break
            size = int(sizeStr)
            count += 1
            #print ('Msg Number: ', str(count), ' size: ', str(size))
            # receive the data
            buffer = (dataSocket.recvfrom(size))[0]
            if not buffer:
                break

            # unpack the bytes into floats
            temp = buffer.split()
            if len(temp) == 1:
                bytes = temp[0]
            else:
                bytes = temp[1]
            if len(bytes) < 4:
                bytes = bytes.zfill(4)
            value = struct.unpack('f', bytes)[0]
            print(value)

            # Do for each report
            for report in reports:
                #print(report)
                number = report["number"]

                try:
                    data = float(value)
                    print(data)

                    # Send in JSON format
                    report["socket"].send(json.dumps(data))
                except IndexError:
                    pass

            '''for line in fileIn.readlines():

                # Read from file
                firstline = line.split()

                #Wait 1 second between sends
                # difference = 0
                # while difference < 1:
                #     difference = time.time() - oldTime
                # oldTime = time.time()

                # Do for each report
                for report in reports:
                    #print(report)
                    number = report["number"]

                    try:
                        value = float(firstline[number])
                        #print(value)

                        # Send in JSON format
                        report["socket"].send(json.dumps(value))
                    except IndexError:
                        pass
            break'''

        dataSocket.close()
        fileIn.seek(0)
        logfile.flush()
        ws.close()
        del reports[:]

    return jsonify({'success': True})

from Queue import Queue
import sys

reports = {0 : Queue()}
@app.route('/teststream-<slug>', methods=['GET'])
def teststream(slug):
    slug = int(slug)
    if request.method == 'GET':
        if slug in reports:
            data = []
            q = reports[slug]
            while not q.empty():
                data.append(q.get())

            return jsonify({'data' : data})

    return jsonify({'data' : None})


@app.route('/update-session', methods=['POST', 'GET'])
def update_session():
    if request.method == 'GET':
        if 'model' in session:
            return jsonify(json.loads(session['model']))

    elif request.method == 'POST':
        jsonObj = request.get_json(False, False, False)
        session['model'] = json.dumps(jsonObj)
        session.modified = True

        return jsonify({'success' : True})

    return jsonify({'success' : False})

@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)

        print(json.dumps(json_request, indent=3), file=sys.stderr)

        json_request['models'] = None
        json_request['lab_id'] = 0
        json_request['salt'] = None

        daemon_request = {
            'request' : 'addUser',
            'user' : json_request
        }

        username = json_request['username']
        create_daemon_connection(username, True)
        daemon_response = send_request_to_daemon(daemon_request, username)

        if is_response_successful(daemon_response):
            daemon_response['success'] = True

            try:
                socket = daemon_connections[username]
                socket.close()
                #create_daemon_connection(username)
                del daemon_connections[username]
            except:
                pass

        else:
            daemon_response['success'] = False

            try:
                socket = daemon_connections[username]
                socket.close()
                del daemon_connections[username]
            except:
                pass

        print(daemon_response, file=sys.stderr)

        return jsonify(daemon_response)

    return jsonify({'success' : False})



@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)
        #print(json.dumps(json_request, indent=3), file=sys.stderr)
        username = json_request['username']

        if username in daemon_connections:
            print('Username Found!', file=sys.stderr)
            return jsonify({'success' : False, 'reason' : 'User already logged in'})

        if DAEMON_CONNECTED:
            create_daemon_connection(username)

        if username not in report_data:
            report_data[username] = []
        # put logic here to login with daemon
        json_request['request'] = 'login'

        print(json_request, file=sys.stderr)
        daemon_response = send_request_to_daemon(json_request, username)

        if is_response_successful(daemon_response):
            dt = datetime.datetime
            response = make_response(jsonify({'success' : True}))

            if json_request['rememberMe']:
                delta = datetime.timedelta(weeks=+4)
                expiration = dt.combine(datetime.date.today() + delta, dt.min.time())
                response.set_cookie('username', username, max_age=delta.total_seconds(), expires=expiration)

            else:
                response.set_cookie('username', username)

            return response

        else:
            try:
                del daemon_connections[username]
            except:
                pass

            return jsonify(daemon_response)

    return jsonify({'success' : False})

@app.route('/logout', methods=['POST'])
def logout():
    if request.method == 'POST':

        username = request.cookies.get('username')
        if username and username in daemon_connections:
            daemon_connections[username].close()
            del daemon_connections[username]

        response = make_response(jsonify({'success' : True}))
        response.set_cookie('username', '', expires=0)
        return response

    return jsonify({'success' : False})

@app.route('/save-model', methods=['POST'])
def save_model():
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)
        print(json.dumps(json_request, indent=3), file=sys.stderr)

        json_request['request'] = 'saveModel'

        daemon_response = send_request_to_daemon(json_request)

        if is_response_successful(daemon_response):
            return jsonify({'success' : True})

        else:
            return jsonify({'success' : False, 'reason' : daemon_response['reason']})

    return jsonify({'success' : False, 'reason' : 'Non Post'})


@app.route('/get-models', methods=['GET'])
def get_models():
    if request.method == 'GET':
        json_request = {'request' : 'getModels'}

        #daemon_response = send_request_to_daemon(json_request)
        daemon_response = {
            'response' : 'success',
            'models' : {
                'personal' : [],
                'lab' : [],
                'global' : []
            }
        }

        if is_response_successful(daemon_response):
            daemon_response['success'] = True
            return jsonify(daemon_response)

        else:
            return jsonify({'success' : False, 'reason' : daemon_response['reason']})

    return jsonify({'success' : False, 'reason' : 'Non GET'})

@app.route('/undo-model', methods=['POST'])
def undo_model():
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)

        json_request['request'] = 'undoModelChange'

        daemon_response = send_request_to_daemon(json_request)

        if is_response_successful(daemon_response):
            daemon_response['success'] = True
            return jsonify(daemon_response)

        else:
            daemon_response['success'] = False
            return jsonify(daemon_response)

    return jsonify({'success' : False, 'reason' : 'Non POST'})

@app.route('/export-script', methods=['GET', 'POST'])
def export_script():
    global exportFile
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)

        json_request['request'] = 'exportScript'

        daemon_response = send_request_to_daemon(json_request)

        if is_response_successful(daemon_response):
            fileName = json_request['model']['name'] + '.py'
            filePath = os.path.join(app.config['EXPORT_FOLDER'], fileName)

            with open(filePath, 'w') as fout:
                fout.write(daemon_response['script'])

            exportFile = fileName
            return send_from_directory(app.config['EXPORT_FOLDER'], fileName, as_attachment = True)

        else:
            return jsonify({'success' : False, 'reason' : daemon_response['reason']})

    elif request.method == 'GET':
        return send_from_directory(app.config['EXPORT_FOLDER'], exportFile, as_attachment = True)

    return jsonify({'success' : False, 'reason' : 'Non GET or POST'})

def worker(num):
    if not num in reports:
        reports[num] = Queue()

    q = reports[num]

    while True:
        q.put(random.randint(0,10))
        time.sleep(3)

def get_username():
    username = request.cookies.get('username')
    return username

def send_request_to_daemon(json_request, username = None):
    if not DAEMON_CONNECTED:
        return {
            'response' : 'success',
            'reason' : 'good'
        }

    if username is None:
        username = get_username()

    try:
        daemon_socket = daemon_connections[username]
        daemon_socket.send(json.dumps(json_request))

        complete_message = False
        result = daemon_socket.recv(4096)

        while not complete_message:
            try:
                result_json = json.loads(result)
                complete_message = True

            except:
                result += daemon_socket.recv(4096)

        print(result_json, file=sys.stderr)

        return result_json
    except Exception, e:
        print('Error with daemon socket,', e, file=sys.stderr)
        return {'response' : 'failure', 'reason' : 'Socket Error'}

def create_daemon_connection(username, adding_user = False):
    daemon_socket = socket(AF_INET, SOCK_STREAM)
    host = DAEMON_HOST
    port = 8009 if adding_user else 8004

    try:
        daemon_socket.connect((host, port))
        daemon_connections[username] = daemon_socket

    except Exception, e:
        print('Error creating daemon socket,', e, file=sys.stderr)

def is_response_successful(daemon_response):
    return daemon_response['response'] == 'success'

def delete_session():
    if 'model' in session:
        del session['model']

# If we're running this script directly (eg. 'python server.py')
# run the Flask application to start accepting connections
if __name__ == "__main__":
    # threads = [threading.Thread(target=worker, args=(i,)) for i in range(3)]
    # for t in threads:
    #     t.daemon = True
    #     t.start()

    app.run(port=8000)
    #server = WSGIServer(('localhost', 8000), app, handler_class=WebSocketHandler)
    #server.serve_forever()
