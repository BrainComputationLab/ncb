
ncbApp.controller("SimulationCtrl", function(){
  this.tab = 0;
  this.paramsMinimized = true;
  this.buttonText = "- Minimize";

  this.simOutput = [];
  this.simInput = [];
  this.inputNum = 1;
  this.outputNum = 1;

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
    if(this.tab == 0){
      this.simInput.push(new simulationInput("Input" + this.inputNum));
      this.inputNum++;
    }
    // if output tab selected add output param
    else{
      this.simOutput.push(new simulationOutput("Output" + this.outputNum));
      this.outputNum++;
    }
  };

  this.removeParam = function(param){
    // remove param if found
    var myIndex; 

    // attempt to remove input
    if(param.className === "simulationInput"){
      myIndex = getParamIndex(this.simInput, param.name)
      if(myIndex != -1){
        this.simInput.splice(myIndex, 1);
      }
    }
    // attempt to remove output
    else{
      myIndex = getParamIndex(this.simOutput, param.name)
      if(myIndex != -1){
        this.simOutput.splice(myIndex, 1);
      }
    }
  }

});
