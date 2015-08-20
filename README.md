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
sudo apt-get install python2.7 python-pip curl virtualenv mongodb
~~~~

NCB uses node.js to run its web technologies. To install this run the following command, then restart your terminal. (Note the init script only needs to be run twice if node.js has not already been installed)

~~~~
. init.sh
~~~~

The initialization script needs to be run every time a new terminal session is started. Again to run the initialization script run

~~~~
. init.sh
~~~~

To run, simply run the following command.

~~~~
gulp
~~~~

This rebuilds the project automatically, while running the server, so
changes show up more or less instantly.

**&copy; University of Nevada Reno**
