
ncbApp.controller("SimulationCtrl", function(){
  this.tab = 0;
  this.paramsMinimized = true;
  this.buttonText = "- Minimize";

  // sim inputs / outputs
  this.simOutput = [];
  this.simInput = [];
  this.selected = null;
  this.inputNum = 1;
  this.outputNum = 1;

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

});
