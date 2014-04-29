from __future__ import print_function
from flask import Flask, render_template, send_from_directory, redirect, request, url_for, jsonify, send_file
from werkzeug import secure_filename
import datetime, os, json, util

# Create new application
app = Flask(__name__)

# enable debugging
app.debug = True

# set upload folder and allowed extensions
allowedFileExtensions = set(['json','py'])

# register upload folder with flask app
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['EXPORT_FOLDER'] = 'exports'

# create recent file variable
importFile = 'import.json'
exportFile = 'export.json'
importFilePath = os.path.join(app.config['UPLOAD_FOLDER'], importFile)
exportFilePath = os.path.join(app.config['EXPORT_FOLDER'], exportFile)

# function see if file extension allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in allowedFileExtensions

def loadJSONFile(fileName):
    try:
        with open(fileName) as fin:
            jsonObj = json.load(fin)

    except IOError:
        print("Error: %s not found." % (fileName,))
        return {'success': False}

    util.changeAllKeys(jsonObj, u'groups', u'cellGroups')
    util.changeAllKeys(jsonObj, u'neuron_aliases', u'cellAliases')
    util.changeAllKeys(jsonObj, u'entity_name', u'name')
    util.changeAllKeys(jsonObj, u'entity_type', u'type')

    return jsonObj

def saveJSONFile(fileName, JSON):
    util.changeAllKeys(JSON, u'cellGroups', u'groups')
    util.changeAllKeys(JSON, u'cellAliases', u'neuron_aliases')
    util.changeAllKeys(JSON, u'name', u'entity_name')
    util.changeAllKeys(JSON, u'type', u'entity_type')

    with open(fileName, 'w') as fout:
        json.dump(JSON, fout, indent=4)


@app.route('/import', methods=['POST', 'GET'])
def importFile():
    if request.method == 'POST':
        webFile = request.files['uploadFile']
        # if file exists and is allowed extension
        if webFile: #and allowed_file(webFile.filename):
            # save file to server filesystem
            #name = secure_filename(importFile)
            #print(name)
            webFile.save(importFilePath)
            #print("Here2")
            jsonObj = loadJSONFile(importFilePath)
            # return JSON object to determine success
            print("GOT: ", end="")
            print(jsonObj)
            return jsonify(jsonObj)

    elif request.method == 'GET':
        jsonObj = loadJSONFile(importFile)
        return jsonify(jsonObj)

    else:
        return jsonify({'success': False})

@app.route('/export', methods=['POST', 'GET'])
def exportFile():
    global exportFile
    if request.method == 'POST':
        jsonObj = request.get_json(False,False,False)

        fileName = jsonObj['filename'] + jsonObj['file_extension']
        print(fileName)
        
        del jsonObj['filename']
        del jsonObj['file_extension']
        filePath = os.path.join(app.config['EXPORT_FOLDER'], fileName)
        saveJSONFile(filePath, jsonObj)
        print(jsonObj)

        exportFile = fileName
        
        return send_from_directory(app.config['EXPORT_FOLDER'], fileName, as_attachment = True)

    elif request.method == 'GET':
        return send_from_directory(app.config['EXPORT_FOLDER'], exportFile, as_attachment = True)

    else:
        return jsonify({"success" : False})

# function to view / download an already uploaded file
@app.route('/uploads/<filename>', methods=["GET"])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment = True)

@app.route('/json', methods=['POST', 'GET'])
def sendJSON():
    global recentUpload
    if request.method == 'POST':
        jsonObj = request.get_json(False,False,False)

        print("JSON RECEIVED")

        util.changeAllKeys(jsonObj, u'cellGroups', u'groups')
        util.changeAllKeys(jsonObj, u'cellAliases', u'neuron_aliases')
        util.changeAllKeys(jsonObj, u'name', u'entity_name')
        util.changeAllKeys(jsonObj, u'type', u'entity_type')

        print(json.dumps(jsonObj, indent=4))

        recentUpload = recentUpload.replace(app.config['UPLOAD_FOLDER'] + '/', 'exports/')
        print('Export File: %s' % recentUpload)
        with open(recentUpload, 'w') as fout:
            json.dump(jsonObj, fout, indent=4)

        return jsonify({"success" : True})

    elif request.method == 'GET':
        try:
            print("using file: %s" % recentUpload)
            with open(recentUpload) as fin:
                jsonObj = json.load(fin)

            print("JSON SENT")
            print(jsonObj)
            return jsonify(jsonObj)

        except IOError:
            print("SERVER ERROR: No JSON file to upload!")

    return jsonify({"success" : False})
# Serves the main application
@app.route('/')
def mainPage():
    if not os.path.isdir(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    if not os.path.isdir(app.config['EXPORT_FOLDER']):
        os.makedirs(app.config['EXPORT_FOLDER'])

    # get year for copyright tag
    return render_template('index.html', year = datetime.datetime.now().year)

# Serves static resources like css, js, images, etc.
@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/assets/', resource)

# Run the server if this file is run directly
if __name__ == '__main__':
    app.run()
