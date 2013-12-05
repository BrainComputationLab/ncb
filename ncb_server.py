from flask import Flask, render_template, send_from_directory, redirect, request, url_for, jsonify
from werkzeug import secure_filename
import datetime, os

# Create new application
app = Flask(__name__)

# enable debugging
app.debug = True

# set upload folder and allowed extensions
uploadFolder = 'uploads'
allowedFileExtensions = set(['json','py'])

# register upload folder with flask app
app.config['UPLOAD_FOLDER'] = uploadFolder

# function see if file extension allowed
def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1] in allowedFileExtensions

# function to upload file from web page
@app.route('/uploads', methods=['POST'])
def uploadFile():
	# if user sending file
    if request.method == 'POST':
    	# get the file descriptor
        file = request.files['uploadFile']
        # if file exists and is allowed extension
        if file and allowed_file(file.filename):
        	# get the secure version of the filename
            filename = secure_filename(file.filename)
            # save file to server filesystem
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # return JSON object to determine success
            return jsonify({"success" : True})

    # otherwise return failure
	return jsonify({"success" : False})

# function to view / download an already uploaded file
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

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
