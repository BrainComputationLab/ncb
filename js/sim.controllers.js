
ncbApp.controller("SimulationCtrl", ["$rootScope", function($rootScope){
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

  // simulation parameters
  this.simName = null;
  this.FSV = null;
  this.seed = null;
  this.duration = null;
  this.interactive = "No";
  this.includeDistance = "No";


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

  // add a new input or output parameter
  this.addNewParam = function(){

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
