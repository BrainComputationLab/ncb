# Neo-Cortical Builder [![Build Status](https://travis-ci.org/BrainComputationLab/ncb.png)](https://travis-ci.org/BrainComputationLab/ncb)

Neo-Cortical Builder is a web-based tool to allow neuroscientists to create,
run, and collect results from brain simulations using the NCS simulator.

## Development Status

Pre-Alpha

## TODO’s

Everything, but most importantly, it will need to use RequireJS at some point
in the future to make the project sane.

## Requirements

* Node 0.11+

## Running

~~~~
grunt
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
