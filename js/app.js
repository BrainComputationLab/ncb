var ncbApp = angular.module('ncbApp', ['snap', 'colorpicker.module', 'mgcrea.ngStrap', 'mgcrea.ngStrap.tooltip', 'xeditable']);

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
var newNcs = new ncsParam();
var newhh = new hodgkinHuxleyParam();
var newIzhi = new izhikevichParam();
var param = new cell("Param", "HodgkinHuxley", newhh);
var param2 = new cell("Param2", "NCS", newNcs);
var param3 = new cell("Param3", "Izhikevich", newIzhi);
myModels = [
  new cell("Cell 1", "NCS", newNcs),
  new cell("Cell 2", "HodgkinHuxley", newhh),
    new cellGroup('Cell Group 1', 1, new izhikevichParam(), "Izhikevich", 'box'),
    new cellGroup('Cell Group 2', 2, new ncsParam(), "NCS", 'box'),
];
myDBModels  = [
  new cell("Cell 3", "Izhikevich", newIzhi),
    new cellGroup('Cell Group 3', 3, new hodgkinHuxleyParam(), "HodgkinHuxley", 'box'),
    new cellGroup('Cell Group 4', 4, new ncsParam(), "NCS", 'box'),
];

myModels[2].cellGroups.push(new cell("Cell 4", "NCS", newNcs));
myModels[2].cellGroups.push(new cell("Cell 5", "Izhikevich", newIzhi));
myModels[2].cellGroups.push(new cellGroup('Cell Group 5', 5, new hodgkinHuxleyParam(), "HodgkinHuxley", 'box'));
myModels[2].cellGroups.push(new cell("Cell 6", "NCS", newNcs));
myModels[2].cellGroups.push(new cell("Cell 7", "Izhikevich", newIzhi));
myModels[2].cellGroups.push(new cellGroup('Cell Group 7', 5, new hodgkinHuxleyParam(), "HodgkinHuxley", 'box'));
myModels[2].cellGroups[2].cellGroups.push(new cell("Cell 8", "Izhikevich", newIzhi));
myModels[2].cellGroups[2].cellGroups.push(new cellGroup('Cell Group 8', 6, new ncsParam(), "NCS", 'box'));

/////////////////////////////////////////////////////////////////////////////////////////

// disable right drawer
ncbApp.config(function(snapRemoteProvider) {
    snapRemoteProvider.globalOptions.disable = 'right';
    // or
    snapRemoteProvider.globalOptions = {
      disable: 'right',
      hyperextensible: false,
      touchToDrag: false,
      tapToClose: false
      // ... others options
    };
});

// set editable theme
ncbApp.run(function(editableOptions){
  editableOptions.theme = 'bs3'; // bootstrap 3 theme
});
