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
  this.possibleTargets = [];
  this.possibleOutputTargets = [];

  // simulation parameters
  this.simName = null;
  this.FSV = null;
  this.seed = null;
  this.duration = null;
  this.interactive = "No";
  this.includeDistance = "No";

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
    this.tab = setTab;
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
    var appendTargets = function(cellGroup, targets, currentLevel) {
      for(var i = 0; i < cellGroup.length; i++) {
        var space = '';
        for(var j = 0; j < currentLevel * 2; j++) {
          space += '&nbsp;';
        }

        var name = space + '&bull; ' + cellGroup[i].name;
        targets.push({val: cellGroup[i].name, name: $sce.trustAsHtml(name)});

        if(cellGroup[i].cellGroups != undefined)
          appendTargets(cellGroup[i].cellGroups, targets, currentLevel + 1);
      }
    };

    var targets = [];
    var model = currentModelService.getCurrentModel();
    appendTargets(currentModelService.getData(), targets, 0);

    for(var i = 0; i < model.synapses.length; i++) {
      var str = '&bull; ' + model.synapses[i].pre + ' &rarr; ' + model.synapses[i].post;
      targets.push({val: model.synapses[i].description, name: $sce.trustAsHtml(str)});
    }
    return targets;
  };

  var cont = this;
  $scope.$on('page-changed', function(event) {
    cont.possibleTargets = cont.getTargets();

    if(cont.possibleTargets.length === 0)
      cont.clearInputTargets();

    cont.setParams();
  });

  this.clearInputTargets = function() {
    for(var i = 0; i < this.simInput.length; i++)
      this.simInput[i].inputTarget = 'No Target';
  }

  // add a new input or output parameter
  this.addNewParam = function(){
    this.possibleTargets = this.getTargets();
    if(this.possibleTargets.length === 0)
      this.clearInputTargets();
    // if input tab selected add input param
    if(this.tab === 0){
      this.simInput.push(new simulationInput("Input" + this.inputNum));
      this.inputNum++;
    }
    // if output tab selected add output param
    else{
      this.simOutput.push(new simulationOutput("Output" + this.outputNum));
      this.outputNum++;
    }
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
  };

  this.selectParam = function(param){
    this.selected = param;
  };

  this.setParams = function() {
    var simParams = {name: this.simName, fsv: this.FSV, seed: this.seed, duration: this.duration, interactive: this.interactive, includeDistance: this.includeDistance, outputs: this.simOutput, inputs: this.simInput};

    currentModelService.setSimParams(simParams);
  };

  this.setInputTarget = function(target) {
    if(this.selected != null)
      this.selected.inputTarget = target;
  }

  this.launchSimulation = function(){
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
    var json = JSON.stringify({model: model, simulation: $scope.simulationParams}, null, "\t");
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
