[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/BrainComputationLab/ncb?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
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

Add the following to the bottom of your ~/.bashrc file:

~~~~
export NVM_DIR="$HOME/.nvm"
source $HOME/.nvm/nvm.sh
nvm use 0.10
node --version
~~~~

This should yield an output like <code>v0.10.28</code>

Now that node is installed, we can install the node package dependencies.

~~~~
npm install
~~~~

Install Bower, the frontend library manager:

~~~~
npm install -g bower
~~~~

Update the Bower dependencies:

~~~~
bower update
~~~~

Install the gulp task manager:

~~~~
npm install -g gulp-cli
~~~~

When debugging, this we can use automatic rebuilding. For that run:

~~~~
gulp
~~~~

This rebuilds the project automatically, while running the server, so
changes show up more or less instantly.

In production, use gunicorn

~~~~
cd build/
gunicorn -w 4 server:app
~~~~

Point your browser to <code>http://localhost:8000/</code>

Running Tests
-------------------------------------------------------------------------------

To run Javascript tests

~~~~
gulp mocha
~~~~

To run Python tests on the backend

~~~~
nosetests --with-coverage --cover-package=ncb ncb/tests/*.py
~~~~

-------------------------------------------------------------------------------

**&copy; University of Nevada Reno**
