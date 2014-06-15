from __future__ import unicode_literals
from flask import Flask, request, jsonify, send_from_directory
import json

# Create new application
app = Flask(__name__)
# Debugging is okay for now
app.debug = True


@app.route('/login')
def login_route():
    return 'not implemented', 500


@app.route('/')
def index_route():
    return app.send_static_file('index.html')


# Serves static resources like index.html, css, js, images, etc.
@app.route('/assets/<path:resource>')
def serve_static_resource(resource):
    # Return the static file
    return send_from_directory('static/assets/', resource)


# If we're running this script directly (eg. 'python server.py')
# run the Flask application to start accepting connections
if __name__ == "__main__":
    app.run('localhost', 5000)
