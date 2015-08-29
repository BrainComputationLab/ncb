from __future__ import unicode_literals, print_function
from flask import Flask, request, jsonify, send_from_directory, session, make_response

from socket import *

from db import MongoSessionInterface, MongoAuthenticator

import json, os, time, threading, struct, random, datetime

# Create new application
app = Flask(__name__, static_url_path='', static_folder='')
app.session_interface = MongoSessionInterface(db='testdb')
#sslify = SSLify(app)
# Debugging is okay for now
app.debug = True

auth = MongoAuthenticator(db='testdb', collection='users')
auth.add_user('admin', 'test')

# authDB = AuthenticationDB('TestDB')
# authDB.add_user('admin', 'test')

# set upload folder and allowed extensions
allowedFileExtensions = set(['json','py'])

# register upload folder with flask app
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['EXPORT_FOLDER'] = 'exports'

if not os.path.exists(app.config['EXPORT_FOLDER']):
    os.makedirs(app.config['EXPORT_FOLDER'])

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


importFile = 'import.json'
importFilePath = os.path.join(app.config['UPLOAD_FOLDER'], importFile)
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
    changeAllKeys(JSON, u'baseCellGroups', u'groups')
    changeAllKeys(JSON, u'cellGroups', u'groups')
    changeAllKeys(JSON, u'cellAliases', u'neuron_aliases')
    changeAllKeys(JSON, u'name', u'entity_name')
    changeAllKeys(JSON, u'type', u'entity_type')

    with open(fileName, 'w') as fout:
        json.dump(JSON, fout, indent=4)


#initiates transfer to ncs
@app.route('/transfer', methods=['POST', 'GET'])
def transferData():
    if request.method == 'POST':
        # jsonObj now has simulation parameters and model
        jsonObj = request.get_json(False, False, False)

        # send jsonObj to NCS
        daemonSocket = socket(AF_INET, SOCK_STREAM)

        # for now all socket communication will use the local host
        host = gethostbyname(gethostname())
        print("Attempting to connect on " + host + ": 8004")

        try:
            daemonSocket.connect((host,8004))
            print("Successful connection with NCS daemon")
        except Exception, e:
            print("Error with daemon socket. Exception type is %s" % (str(e),))

        # serialize json object so it can be sent
        data_string = json.dumps(jsonObj)
        daemonSocket.send(data_string)

        #print ("jsonObj: %r" %(jsonObj))
        return jsonify({'success': True})

    return jsonify({'success': False})


# initiates export
@app.route('/export', methods=['POST', 'GET'])
def exportFile():
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
        if webFile: #and allowed_file(webFile.filename):
            # save file to server filesystem
            #name = secure_filename(importFile)
            #print(name)
            #print ("webfile: %r" %(webFile))
            webFile.save(importFilePath)
            #print("Here2")
            jsonObj = loadJSONFile(importFilePath)
            # return JSON object to determine success
            #print("GOT: ", end="")
            #print(jsonObj)
            return jsonify(jsonObj)

    elif request.method == 'GET':
        jsonObj = loadJSONFile(importFile)
        return jsonify(jsonObj)

    else:
        return jsonify({'success': False})


@app.route('/')
# @authDB.requires_auth
def index_route():
    username = request.cookies.get('username')

    if username:
        return app.send_static_file('index.html')

    else:
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

@app.route('/add-user', methods=['POST'])
def add_user():
    pass

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        json_request = request.get_json(False, False, False)
        print(json.dumps(json_request, indent=3), file=sys.stderr)

        # put logic here to login with daemon
        is_user = True

        if is_user:
            dt = datetime.datetime
            response = make_response(jsonify({'success' : True}))

            if json_request['rememberMe']:
                delta = datetime.timedelta(weeks=+1)
                expiration = dt.combine(datetime.date.today() + delta, dt.min.time())
                response.set_cookie('username', json_request['email'], max_age=delta.total_seconds(), expires=expiration)

            else:
                response.set_cookie('username', json_request['email'])

            return response

        else:
            return jsonify({'success' : False})

    return jsonify({'success' : False})

@app.route('/logout', methods=['POST'])
def logout():
    if request.method == 'POST':
        response = make_response(jsonify({'success' : True}))
        response.set_cookie('username', '', expires=0)
        return response

    return jsonify({'success' : False})

def worker(num):
    if not num in reports:
        reports[num] = Queue()

    q = reports[num]

    while True:
        q.put(random.randint(0,10))
        time.sleep(3)


def send_request_to_daemon(json_request):
    host = 'daemonhost'
    port = 10000

    return_value = None

    daemon_socket = socket(AF_INET, SOCK_STREAM)

    try:
        daemon_socket.connect((host, port))
        daemon_socket.send(json.dumps(json_request))

        # TODO: logic for receiving result from daemon
    except Exception, e:
        print('Error with daemon socket,', e, file=sys.stderr)
        return False

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
