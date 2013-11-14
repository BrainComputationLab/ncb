from flask import Flask, render_template, send_from_directory, redirect, request, url_for, jsonify
from werkzeug import secure_filename
import datetime, os

# Create new application
app = Flask(__name__)

# Debugging is okay for now
app.debug = True

uploadFolder = 'uploads'
allowedFileExtensions = set(['json','py'])

app.config['UPLOAD_FOLDER'] = uploadFolder

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1] in allowedFileExtensions

@app.route('/uploads', methods=['POST'])
def uploadFile():
    if request.method == 'POST':
        file = request.files['uploadFile']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            print os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            print "File Found!"
            return jsonify({"success" : True})

	return jsonify({"success" : False})

# function to view / download an uploaded file
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Serves the main application
@app.route('/')
def mainPage():
    year = datetime.datetime.now().year
    return render_template('index.html', year = year)

# Serves static resources like css, js, images, etc.
@app.route('/assets/<path:resource>')
def serveStaticResource(resource):
    return send_from_directory('static/assets/', resource)

# Run the server if this file is run directly
if __name__ == '__main__':
    app.run()
