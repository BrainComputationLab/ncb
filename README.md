# Neo-Cortical Builder [![Build Status](https://travis-ci.org/BrainComputationLab/ncb.png)](https://travis-ci.org/BrainComputationLab/ncb)

Neo-Cortical Builder is a web-based tool to allow neuroscientists to create,
run, and collect results from brain simulations using the NCS simulator.

## Development Status

Pre-Alpha

## TODO’s

Everything, but most importantly, it will need to use RequireJS at some point
in the future to make the project sane.

## Requirements

* Node.js 0.10+

## Setup

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

This should yeild an output like <code>v0.10.28</code>

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
python -m SimpleHTTPServer 8000
~~~~

Point your browser to <code>http://localhost:8000/</code>

## Running Tests

~~~~
grunt mocha
~~~~

-----------
&copy; University of Nevada Reno
