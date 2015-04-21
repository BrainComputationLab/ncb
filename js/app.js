// Get the Angular dependencies
require('angular');
require('restangular');
// Bower plugins require the whole path
require('angular-strap/dist/angular-strap');
require('angular-strap/dist/angular-strap.tpl');
// angular-snap doesn't work without this.
window.Snap = require('snapjs/snap');
require('angular-snap/angular-snap');
require('angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module');
require('angular-xeditable/dist/js/xeditable');
require('angular-oboe');

var utilityFcns = require('./utilityFcns');
var parameters = require('./parameters');
var calciumDependantChannel = parameters.calciumDependantChannel;
var cellGroup = parameters.cellGroup;
var cells = parameters.cells;
var deepCopyArray = utilityFcns.deepCopyArray;
var flatSynapse = parameters.flatSynapse;
var hodgkinHuxleyParam = parameters.hodgkinHuxleyParam;
var izhikevichParam = parameters.izhikevichParam;
var model = parameters.model;
var ncsParam = parameters.ncsParam;
var ncsSynapse = parameters.ncsSynapse;
var particleVariableConstants = parameters.particleVariableConstants;
var voltageGatedChannel = parameters.voltageGatedChannel;
var voltageGatedIonChannel = parameters.voltageGatedIonChannel;
var voltageGatedParticle = parameters.voltageGatedParticle;

var ncbApp = angular.module('ncbApp', ['snap', 'colorpicker.module', 'mgcrea.ngStrap', 'mgcrea.ngStrap.tooltip', 'xeditable',
                                        'ngOboe']);

//////// A COMPONENT IS A GENERAL TERM FOR A MODEL, CELL, OR CELL GROUP /////////////////////////////////
//////// YOU DETERMINE THE COMPONENT TIME THROUGH ITS CLASSIFICATION MEMBER /////////////////////////////

// TEMPORARY TEST VARIABLES //////////////////////////////////////////////////////////
//test models
var testChannel1 = new voltageGatedIonChannel();
var testChannel2 = new calciumDependantChannel();
var testParam = new izhikevichParam();
var test2Param = new ncsParam();
var test3Param = new hodgkinHuxleyParam();
var a1 = new particleVariableConstants();
var b1 = new particleVariableConstants();
var testParticle = new voltageGatedParticle(a1, b1);
var testChannel3 = new voltageGatedChannel(testParticle);
var test4Param = new hodgkinHuxleyParam();
var flatS = new flatSynapse();
var ncsS = new ncsSynapse();

// hard code modals for testing purposes
myModels = [
  new cells("Cell 1", 100, new ncsParam(), "Box"),
  new cells("Cell 2", 50, new hodgkinHuxleyParam(), "Box"),
  new cellGroup('Cell Group 1'),
  new cellGroup('Cell Group 2'),
];
myDBModels  = [
  new cells("Cell 3", 150, new izhikevichParam(), "Sphere"),
  new cellGroup('Cell Group 3'),
  new cellGroup('Cell Group 4'),
  new model()
];

myModels[2].cellGroups.push(new cells("Cell 4", 5, new ncsParam(), "Box"));
myModels[2].cellGroups.push(new cells("Cell 5", 100, new izhikevichParam(), "Box"));
myModels[2].cellGroups.push(new cellGroup('Cell Group 5'));
myModels[2].cellGroups.push(new cells("Cell 6", 13, new ncsParam(), "Box"));
myModels[2].cellGroups.push(new cells("Cell 3", 150, new izhikevichParam(), "Sphere"));
myModels[2].cellGroups.push(new cellGroup('Cell Group 7'));
myModels[2].cellGroups[2].cellGroups.push(new cells("Cell 3", 300, new izhikevichParam(), "Sphere"));
myModels[2].cellGroups[2].cellGroups.push(new cellGroup('Cell Group 8'));
myDBModels[3].name = "Test Model";
myDBModels[3].author ="The wonderful NCB Team";
myDBModels[3].cellGroups.cellGroups = deepCopyArray(myModels[2].cellGroups);

/////////////////////////////////////////////////////////////////////////////////////////

// disable right drawer
ncbApp.config(['snapRemoteProvider', function(snapRemoteProvider) {
    snapRemoteProvider.globalOptions.disable = 'right';
    // or
    snapRemoteProvider.globalOptions = {
      disable: 'right',
      hyperextensible: false,
      touchToDrag: false,
      tapToClose: false
      // ... others options
    };
}]);

// set editable theme
ncbApp.run(['editableOptions', function(editableOptions){
  editableOptions.theme = 'bs3'; // bootstrap 3 theme
}]);

module.exports = {
    myDBModels: myDBModels,
    myModels: myModels,
    ncbApp: ncbApp,
};
