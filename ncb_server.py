from __future__ import print_function
from flask import Flask, render_template, send_from_directory, redirect, request, url_for, jsonify
from werkzeug import secure_filename
import datetime, os, json

# Create new application
app = Flask(__name__)

# enable debugging
app.debug = True

# set upload folder and allowed extensions
allowedFileExtensions = set(['json','py'])

# register upload folder with flask app
app.config['UPLOAD_FOLDER'] = 'uploads'

# create recent file variable
recentUpload = 'temp.json'
parameterFile = 'params.json'

# function see if file extension allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in allowedFileExtensions

# function to upload file from web page
@app.route('/uploads', methods=['POST'])
def uploadFile():
    global recentUpload
    # if user sending file
    if request.method == 'POST':
        # get the file descriptor
        file = request.files['uploadFile']
        # if file exists and is allowed extension
        if file and allowed_file(file.filename):
            # get the secure version of the filename
            filename = secure_filename(file.filename)
            recentUpload = filename
            # if uploads directory does not exist create it
            if not os.path.isdir(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            # save file to server filesystem
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # return JSON object to determine success
            return jsonify({"success" : True})

    # otherwise return failure
    return jsonify({"success" : False})

@app.route('/uploadsim', methods=['POST', 'GET'])
def uploadSimulationParameter():
    global parameterFile
    if request.method == 'POST':
        # get the file descriptor
        file = request.files['uploadFile']
        # if file exists and is allowed extension
        if file and allowed_file(file.filename):
            # get the secure version of the filename
            filename = secure_filename(parameterFile)
            parameterFile = app.config['UPLOAD_FOLDER'] + '/' + filename
            # if uploads directory does not exist create it
            if not os.path.isdir(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            # save file to server filesystem
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # return JSON object to determine success
            print("Received parameters")
            return jsonify({"success" : True})

    elif request.method == 'GET':
        with open(parameterFile) as fin:
            params = json.load(fin)

        print("Parameters Uploaded")
        return jsonify(params)

    # otherwise return failure
    return jsonify({"success" : False})

# function to view / download an already uploaded file
@app.route('/uploads/<filename>', methods=["GET"])
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment = True)

@app.route('/json', methods=['POST', 'GET'])
def sendJSON():
    if request.method == 'POST':
        jsonObj = request.get_json(False,False,False)

        print("JSON RECEIVED")
        print(jsonObj)

        with open(recentUpload, 'w') as fout:
            json.dump(jsonObj, fout)

        return jsonify({"success" : True})

    elif request.method == 'GET':
        with open(recentUpload) as fin:
            jsonObj = json.load(fin)

        print("JSON SENT")
        print(jsonObj)
        return jsonify(jsonObj)

    return jsonify({"success" : False})
# Serves the main application
@app.route('/')
def mainPage():
    # get year for copyright tag
    year = datetime.datetime.now().year
    return render_template('index.html', year = year)

# Serves static resources like css, js, images, etc.
@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/assets/', resource)

# Run the server if this file is run directly
if __name__ == '__main__':
    app.run()
