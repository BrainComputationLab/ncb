 Neo-Cortical Builder
===============================================================================

[![Build Status](https://travis-ci.org/BrainComputationLab/ncb.png)](https://travis-ci.org/BrainComputationLab/ncb)
[![Coverage Status](https://coveralls.io/repos/BrainComputationLab/ncb/badge.png)](https://coveralls.io/r/BrainComputationLab/ncb)

Neo-Cortical Builder is a web-based tool to allow neuroscientists to create,
run, and collect results from brain simulations using the NCS simulator.

Development Status
-------------------------------------------------------------------------------

Pre-Alpha

TODO’s
-------------------------------------------------------------------------------

Everything, but most importantly, it will need to use RequireJS at some point
in the future to make the project sane.

Requirements
-------------------------------------------------------------------------------

* Python 2.7
* MongoDB
* Node.js 0.10+

Setup
-------------------------------------------------------------------------------

If you are on an Ubuntu machine, make sure Python 2.7 as well as pip are
installed by running this command

~~~~
sudo apt-get install python2.7 python-pip
~~~~

To install NCB’s Python dependencies, run this

~~~~
pip install -r requirements.txt
~~~~

We cannot support Python 3.x at the moment because the MongoKit developers
refuse to make their package compatible until the Python 3 standard is
finalized.

You’ll also need to use MongoDB as we use this as our database.

~~~~
sudo apt-get install mongodb
~~~~

If you intend to work on NCB we also require Node.js for web development
reasons (js linting, js testing, concatenation, minification).

If you don’t have Node installed already install it via NVM

~~~~
curl https://raw.githubusercontent.com/creationix/nvm/v0.7.0/install.sh | sh
nvm install 0.10
~~~~

Then tell it to use the latest Node version

~~~~
nvm use 0.10
node --version
~~~~

This should yield an output like <code>v0.10.28</code>

Now that node is installed, we can install the node package dependencies.

~~~~
npm install
~~~~

Now that everything is installed, we can build the project.

~~~~
grunt build:debug
~~~~

Builds a version of NCB for debugging and working on the project.

~~~~
grunt build:dist
~~~~

Builds a production version of NCB for actual use.

To start a debugging build, use Python to create a simple web server in the
dist directory.

~~~~
cd dist/
python server.py
~~~~

In production, use gunicorn

~~~~
cd dist/
gunicorn -w 4 server:app
~~~~

Point your browser to <code>http://localhost:8000/</code>

Running Tests
-------------------------------------------------------------------------------

To run Javascript tests

~~~~
grunt mocha
~~~~

To run Python tests on the backend

~~~~
nosetests --with-coverage --cover-package=ncb ncb/tests/*.py
~~~~

-------------------------------------------------------------------------------

**&copy; University of Nevada Reno**
