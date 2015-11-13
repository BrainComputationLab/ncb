require("angular");
var utilityFcns = require('./utilityFcns');
var app = require('./app');
var parameters = require('./parameters');
var deepCopyArray = utilityFcns.deepCopyArray;
var getParamIndex = utilityFcns.getParamIndex;
var myDBModels = app.myDBModels;
var myModels = app.myModels;
var ncbApp = app.ncbApp;
var simulationInput = parameters.simulationInput;
var simulationOutput = parameters.simulationOutput;
var inputParameters = parameters.inputParameters;

ncbApp.controller("SimulationCtrl", ["$scope", "$rootScope", "$sce", "CurrentModelService",
    function($scope, $rootScope, $sce, currentModelService){

  // param types
  $scope.types = [
    {value: "exact", text: "exact"},
    {value: "uniform", text: "uniform"},
    {value: "normal", text: "normal"}
  ];


  this.tab = 0;
  this.paramsMinimized = true;
  this.buttonText = "- Minimize";

  // sim inputs / outputs
  this.simOutput = [];
  this.simInput = [];
  this.selected = null;
  this.inputNum = 1;
  this.outputNum = 1;
  this.selectedModel = null;
  this.possibleInputTargets = [];

  // simulation parameters
  this.simName = null;
  this.FSV = null;
  this.seed = null;
  this.duration = null;
  this.interactive = "No";
  this.includeDistance = "No";
  this.selectedParamIndex = 0;

  this.possibleReportTypes = [
    {name: "Cell Groups", val: 1},
    {name: "Cell Aliases", val: 2},
    {name: "Synapse Connections", val: 3}
  ];

  this.selectedReportType = this.possibleReportTypes[0].val;

  this.checkNumber = function(value){
      if(isNaN(value) || value.length === 0){
        return "Value must be a number";
      }
  };

  this.checkInteger = function(value){
      if(value % 1 !== 0 || value.length === 0){
        return "Value must be an integer";
      }
  };

  this.checkProbability = function(value){
      if(isNaN(value) || value.length === 0 || value < 0 || value > 1){
        return "Value must be a decimal between 0 and 1";
      }
  };

  this.selectTab = function(setTab){
    if(setTab !== this.tab) {
      this.tab = setTab;
      this.selectedParamIndex = 0;
    }

    this.selected = (this.tab === 0) ? this.simInput[0] : this.simOutput[0];

  };

  this.isSelected = function(checkTab){
    return this.tab === checkTab;
  };

  this.toggleParamVisibility = function(){
    this.buttonText = this.paramsMinimized ? "+ Maximize" : this.buttonText = "- Minimize";

    this.paramsMinimized = !this.paramsMinimized;
  };

  this.getParamVisibility = function(){
    return this.paramsMinimized;
  };

  // create possible targets
  this.getTargets = function() {
    var appendTargets = function(cellGroup, targets, cellGroups, aliases, currentLevel) {
      for(var i = 0; i < cellGroup.length; i++) {
        var space = '';
        for(var j = 0; j < currentLevel * 2; j++) {
          space += '&nbsp;';
        }

        var name = space + '&bull; ' + cellGroup[i].name;
        var nonSpacedName = '&bull; ' + cellGroup[i].name;
        targets.push({val: cellGroup[i].name, name: $sce.trustAsHtml(name)});

        if(cellGroup[i].classification === 'cells')
          cellGroups.push({val: cellGroup[i].name, name: $sce.trustAsHtml(nonSpacedName)});

        else
          aliases.push({val: cellGroup[i].name, name: $sce.trustAsHtml(nonSpacedName)});

        if(cellGroup[i].cellGroups != undefined)
          appendTargets(cellGroup[i].cellGroups, targets, cellGroups, aliases, currentLevel + 1);
      }
    };

    var targets = [];
    var cellGroups = [];
    var aliases = [];
    var synapses = [];

    var model = currentModelService.getCurrentModel();
    appendTargets(currentModelService.getData(), targets, cellGroups, aliases, synapses, 0);

    this.possibleInputTargets = targets.slice(0);

    for(var i = 0; i < model.synapses.length; i++) {
      var str = '&bull; ' + model.synapses[i].pre + ' &rarr; ' + model.synapses[i].post;
      targets.push({val: model.synapses[i].description, name: $sce.trustAsHtml(str)});

      // TODO FIX!!!!! //
      var obj = {val: model.synapses[i].description, name: $sce.trustAsHtml(str)};
      synapses.push(obj);

      console.log("OBJ:");
      console.log(obj);
    }

    this.possibleTargets = targets;

    if(this.selected != null) {
      switch(this.selected.possibleReportType) {
        case 1:
          this.selected.possibleOutputTargets = cellGroups;
          break;

        case 2:
          this.selected.possibleOutputTargets = aliases;
          break;

        case 3:
          this.selected.possibleOutputTargets = synapses;
          break;
      }
    }
  };

  var cont = this;
  $scope.$on('page-changed', function(event) {
    cont.getTargets();

    if(cont.possibleInputTargets.length === 0)
      cont.clearInputTargets();

    var previousSelection = cont.selected;
    for(var i = 0; i < cont.simOutput.length; i++) {
      cont.selected = cont.simOutput[i];
      cont.updateReportTargets();
    }

    cont.selected = previousSelection;

    cont.setParams();
  });

  $scope.$on('session-loaded', function(event) {
    cont.getTargets();

    var previousSelection = cont.selected;
    for(var i = 0; i < cont.simOutput.length; i++) {
      cont.selected = cont.simOutput[i];
      cont.updateReportTargets();
    }

    cont.simInput = currentModelService.simParams.inputs || [];
    cont.simOutput = currentModelService.simParams.outputs || [];
    cont.simName = currentModelService.simParams.name || null;
    cont.FSV = currentModelService.simParams.fsv || null;
    cont.seed = currentModelService.simParams.seed || null;
    cont.duration = currentModelService.simParams.duration || null;
    cont.includeDistance = currentModelService.simParams.includeDistance || "No";
    cont.interactive = currentModelService.simParams.interactive || "No";

    if(cont.simInput.length > 0)
      cont.selected = cont.simInput[0];

    else
      cont.selected = null;
  });

  this.clearInputTargets = function() {
    for(var i = 0; i < this.simInput.length; i++)
      for(var j = 0; j < this.simInput[i].inputTargets.length; j++)
        this.simInput[i].inputTargets[j] = 'None';

      this.setParams();
  };

  this.clearOutputTargets = function() {
    for(var i = 0; i < this.simOutput.length; i++)
      for(var j = 0; j < this.simOutput[i].reportTargets.length; j++)
        this.simOutput[i].reportTargets[j] = 'None';

      this.setParams();
  };

  // add a new input or output parameter
  this.addNewParam = function(){
    this.getTargets();
    if(this.possibleTargets.length === 0) {
      this.clearInputTargets();
      this.clearOutputTargets();
    }
    // if input tab selected add input param
    if(this.tab === 0){
      this.selectedParamIndex = this.inputNum - 1;
      this.simInput.push(new simulationInput("Input" + this.inputNum, new inputParameters()));
      this.inputNum++;

      this.selected = this.simInput[this.simInput.length-1];
    }
    // if output tab selected add output param
    else{
      this.selectedParamIndex = this.outputNum - 1;
      this.simOutput.push(new simulationOutput("Output" + this.outputNum));
      this.outputNum++;

      this.selected = this.simOutput[this.simOutput.length-1];
      this.updateReportTargets();
    }

    this.setParams();
  };

  // remove an input or output from the simulation
  this.removeParam = function(param){
    // remove param if found
    var myIndex;

    // attempt to remove input
    if(param.className === "simulationInput"){
      myIndex = getParamIndex(this.simInput, param.name);
      if(myIndex != -1){
        this.simInput.splice(myIndex, 1);
      }
    }
    // attempt to remove output
    else{
      myIndex = getParamIndex(this.simOutput, param.name);
      if(myIndex != -1){
        this.simOutput.splice(myIndex, 1);
      }
    }

    this.setParams();
  };

  this.selectParam = function(param, index){
    this.selected = param;
    this.selectedParamIndex = index;
  };

  this.isSelectedParam = function(index) {
    return this.selectedParamIndex === index;
  };

  this.setParams = function() {
    var output = angular.copy(this.simOutput);
    delete output.possibleOutputTargets;
    delete output.possibleReportType;

    var input = angular.copy(this.simInput);
    delete input.possibleInputTargets;

    var simParams = {name: this.simName, fsv: this.FSV, seed: this.seed, duration: this.duration, interactive: this.interactive, includeDistance: this.includeDistance, outputs: output, inputs: input};

    currentModelService.setSimParams(simParams);
    //currentModelService.updateModelSession();

    return simParams;
  };

  this.setInputTarget = function(index, target) {
    if(this.selected != null && index < this.selected.inputTargets.length)
      this.selected.inputTargets[index] = target;
  };

  this.addInputTarget = function() {
    if(this.possibleInputTargets.length > 0)
      this.selected.inputTargets.push(this.possibleInputTargets[0].val);

    else
      this.selected.inputTargets.push('None');
  };

  this.removeInputTarget = function(index) {
    if(this.selected.inputTargets.length > 0 && index < this.selected.inputTargets.length)
        this.selected.inputTargets.splice(index, 1);
  };

  this.getInputTargets = function() {
    if(this.selected != null)
        return this.selected.inputTargets;
  };

  this.getOutputTargets = function() {
    if(this.selected != null) {
      return this.selected.reportTargets;
    }
  };

  this.addOutputTarget = function() {
    if(this.selected.possibleOutputTargets.length > 0)
      this.selected.reportTargets.push(this.selected.possibleOutputTargets[0].val);

    else
      this.selected.reportTargets.push('None');
  };

  this.removeOutputTarget = function(index) {
    if(this.selected.reportTargets.length > 0 && index < this.selected.reportTargets.length)
        this.selected.reportTargets.splice(index, 1);
  };

  this.updateReportTargets = function() {
    this.getTargets();
    for(var i = 0; i < this.selected.reportTargets.length; i++) {
      if(this.selected.possibleOutputTargets.length > 0)
        this.selected.reportTargets[i] = this.selected.possibleOutputTargets[0].val;

      else
        this.selected.reportTargets[i] = 'None';
    }
  };

  this.launchSimulation = function() {
    var simParams = {name: this.simName, fsv: this.FSV, seed: this.seed, duration: this.duration, interactive: this.interactive, includeDistance: this.includeDistance, outputs: this.simOutput, inputs: this.simInput};

    $rootScope.$broadcast('launchModal', simParams);
  };

  this.styleElement = function(model){
    if(model === this.selected){
      return {
                'background-image': 'linear-gradient(left, #EEEEEE, #EEEEEE 100%, transparent 100%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, #EEEEEE, #EEEEEE 100%, transparent 100%, transparent 100%)',
            };
    }
    else{
      return {
                'background-image': 'linear-gradient(left, #FFFFFF, #FFFFFF 100%, transparent 100%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, #FFFFFF, #FFFFFF 100%, transparent 100%, transparent 100%)',
            };
    }
  };
}]);

ncbApp.controller("LaunchSimulationController", ['$rootScope', '$scope', '$http', 'ColorService', 'CurrentModelService',
 function($rootScope, $scope, $http, colorService, currentModelService){

  this.selectedDropDown = "current";
  $scope.selected = null;
  $scope.modelList = null;
  $scope.simulationParams = null;

  $scope.$on('launchModal', function(event, params){

    $scope.simulationParams = params;
    $scope.modelList = deepCopyArray(myModels);
    for(var i=0; i < myDBModels.length; i++){
      $scope.modelList.push(myDBModels[i]);
    }

    $scope.selected = null;

  });

  $scope.setSelected = function(model){
    $scope.selected = model;
  };

  this.styleModel = function(model){
    return colorService.styleElement(model);
  };

  this.launch = function(){
    var model = null;
    if(this.selectedDropDown == "current"){
      // use current model being built
      model = currentModelService.getCurrentModel();
    }
    else{
      // use selected model from list
      model = $scope.selected;
    }

    // sends model and simulation parameters to server for transfer
    var json = angular.toJson({model: model, simulation: $scope.simulationParams}, null, "\t");
    $http.post('/transfer', json).
      success(function(data, status, headers, config) {
        // this callback will be called asynchronously
        //console.log(data);
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log(status);
      });

  };

}]);