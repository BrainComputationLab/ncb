var parameters = require('./parameters');
var utilityFcns = require('./utilityFcns');
var app = require('./app');
require('angular');
var cellGroup = parameters.cellGroup;
var deepCopyArray = utilityFcns.deepCopyArray;
var deepCopy = utilityFcns.deepCopy;
var getCellIndex = utilityFcns.getCellIndex;
var getSynapseIndex = utilityFcns.getSynapseIndex;
var model = parameters.model;
var ncbApp = app.ncbApp;

// create side panel service
ncbApp.factory('SidePanelService', ['$rootScope', function($rootScope) {
  var sidePanelService = {};

  sidePanelService.breadCrumbs = [{name: "Home", index: 0}];
  sidePanelService.visible = false;
  sidePanelService.data = null;
  sidePanelService.component = {};

  sidePanelService.setVisible = function(isVisible) {
    this.visible = isVisible;
  };

  sidePanelService.setData = function(newData){
    // set the base data to new data
    this.data = newData;
    // set the current component to new data
    this.component = newData;

    // rest breadcrumbs to home
    this.breadCrumbs = [{name: "Home", index: 0}];
  };

  sidePanelService.setComponent = function(component, index){

    // set current component and create breadcrumb for it
    this.component = component;
    this.breadCrumbs.push({name: component.name, index: index});
  };

  sidePanelService.goHome = function(){
    this.breadCrumbs = [{name: "Home", index: 0}];
    this.component = this.data;
  };

/*currentModelService.goToBreadCrumb = function(index){

  // go home if bread crumb index is 0
  if(index === 0)
    this.goHome();

  // if not home loop through breadcumbs to reach selected index
  else if(index < this.breadCrumbs.length){

    // go down the first layer (starts at 1 : home has a useless index)
    this.selected = this.currentModel.cellGroups.cellGroups[this.breadCrumbs[1].index];

    // go down each following layer index you hit the bread crumb index
    var setIndex;

    for(var i=2; i<=index; i++){

      // go down to the next level (components is always an array of cell groups / components[i] is a cellGroup class)
      setIndex = this.breadCrumbs[i].index;
      this.selected = this.selected.cellGroups[setIndex];
    }

    // shorten breadcrumbs to selected index
    this.breadCrumbs.splice(index+1);
  }
};*/

  sidePanelService.goToBreadCrumb = function(index){
    var setIndex;
    var i;

    // go home if bread crumb index is 0
    if(index === 0)
      this.goHome();

    else if(index < this.breadCrumbs.length){
      // if not home loop through breadcumbs to reach selected index
      // method to navigate if root was cell group
      if(this.data.classification == "cellGroup"){
        this.component = this.data;

        for(i=1; i<=index; i++){
          setIndex = this.breadCrumbs[i].index;
          this.component = this.component.cellGroups[setIndex];
        }
      }
      // method to navigate if root was model
      else{
        // go down the first layer (starts at 1 : home has a useless index)
        this.component = this.data.cellGroups.cellGroups[this.breadCrumbs[1].index];
        // go down each following layer index you hit the bread crumb index
        for(i=2; i<=index; i++){
          // go down to the next level
          setIndex = this.breadCrumbs[i].index;
          this.component = this.component.cellGroups[setIndex];
        }
      }

      // shorten breadcrumbs to selected index
      this.breadCrumbs.splice(index+1);
    }
  };

  // get bread crumbs
  sidePanelService.getBreadCrumbs = function(){
    return this.breadCrumbs;
  };

  sidePanelService.getData = function(){
    return this.component;
  };

  return sidePanelService;
}]);

// service that provides set website colors
ncbApp.factory('ColorService', ['$rootScope', function($rootScope){
  var colorService = {};

  colorService.colors = {cell: '#8781BD' , cellGroup: '#00568C', model:'#5D6B74', synapse:'#333333'};

  colorService.getColors = function(){
    return this.colors;
  };

  colorService.setColors = function(newColors){
    this.colors = newColors;
  };

  colorService.styleElement = function(model){
    //alert(model.name);
    // style element based off type (cell, cell group, model)
    if (model.classification === 'cells'){
      return {
                'background-image': 'linear-gradient(left, '+this.colors.cell+', '+this.colors.cell+' 10px, transparent 10px, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.cell+', '+this.colors.cell+' 10px, transparent 10px, transparent 100%)',
            };
    }
    else if (model.classification === 'cellGroup'){
      return {
                'background-image': 'linear-gradient(left, '+this.colors.cellGroup+', '+this.colors.cellGroup+' 10px, transparent 10px, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.cellGroup+', '+this.colors.cellGroup+' 10px, transparent 10px, transparent 100%)',
            };
    }
    else if (model.classification === 'model'){
      return {
                'background-image': 'linear-gradient(left, '+this.colors.model+', '+this.colors.model+' 10px, transparent 10px, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.model+', '+this.colors.model+' 10px, transparent 10px, transparent 100%)',
            };
    }
    else if (model.classification === 'synapseGroup'){
      return {
                'background-image': 'linear-gradient(left, '+this.colors.synapse+', '+this.colors.synapse+' 10px, transparent 10px, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.synapse+', '+this.colors.synapse+' 10px, transparent 10px, transparent 100%)',
            };
    }
  };

  colorService.styleSelected = function(model){
    var textColor;

    // style element based off type (cell, cell group, model)
    if (model.classification === 'cells'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt(this.colors.cell.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        textColor = '#FFFFFF';
      }
      else{
        textColor = '#000000';
      }
      return {
                'background-image': 'linear-gradient(left, '+this.colors.cell+', '+this.colors.cell+' 100%, transparent 100%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.cell+', '+this.colors.cell+' 100%, transparent 100%, transparent 100%)',
                'color' : textColor,
            };
    }
    else if (model.classification === 'cellGroup'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt(this.colors.cellGroup.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        textColor = '#FFFFFF';
      }
      else{
        textColor = '#000000';
      }
      return {
                'background-image': 'linear-gradient(left, '+this.colors.cellGroup+', '+this.colors.cellGroup+' 100%, transparent 100%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.cellGroup+', '+this.colors.cellGroup+' 100%, transparent 100%, transparent 100%)',
                'color' : ""+textColor,
            };
    }
    else if (model.classification === 'synapseGroup'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt(this.colors.synapse.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        textColor = '#FFFFFF';
      }
      else{
        textColor = '#000000';
      }
      return {
                'background-image': 'linear-gradient(left, '+this.colors.synapse+', '+this.colors.synapse+' 100%, transparent 100%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+this.colors.synapse+', '+this.colors.synapse+' 100%, transparent 100%, transparent 100%)',
                'color' : ""+textColor,
            };
    }
  };

  return colorService;
}]);


// service that allows the current model to be modified and accessed
ncbApp.factory('CurrentModelService', ['$rootScope', '$http', '$interval', '$timeout', function($rootScope, $http, $interval, $timeout) {
  var currentModelService = {};

  // store current model in service so it can be accessed anywhere
  currentModelService.currentModel = new model();

  currentModelService.breadCrumbs = [{name: "Home", index: 0}];
  currentModelService.selected = currentModelService.currentModel.cellGroups;
  currentModelService.displayedComponent = null;

  currentModelService.simParams = {};

  currentModelService.updateModelSession = function() {
    var json = angular.toJson({model: this.currentModel, simulation: this.simParams}, null, "\t");
    $http.post('/update-session', json).
      success(function(data, status, headers, config) {
        var d = new Date();
        console.log("Session Updated " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
      }).
      error(function(data, status, headers, config) {
        var d = new Date();
        console.error("Session Update Failed " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
      });
  };

  $interval(function() {
    currentModelService.updateModelSession();
  }, 30000, 0, false);

  currentModelService.loadModelFromSession = function() {
    $http.get('/update-session').
      success(function(data, status, headers, config) {
        var d = new Date();
        console.log("Session Loaded " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());

        currentModelService.currentModel = data.model || new model();
        currentModelService.selected = currentModelService.currentModel.cellGroups;
        currentModelService.displayedComponent = null;
        currentModelService.simParams = data.simulation || {};


        console.log(currentModelService);

        currentModelService.goHome();

        $timeout(function() {
          $rootScope.$broadcast('session-loaded');
        }, 100);
      }).
      error(function(data, status, headers, config) {
        var d = new Date();
        console.error("Session Load Failed " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
      });
  };

  currentModelService.setSimParams = function(params) {
    this.simParams = params;
    this.updateModelSession();
  };

  currentModelService.getSimParams = function() {
    return this.simParams;
  }

  currentModelService.setName = function(name){
    this.currentModel.name = name;
  };

  currentModelService.addToModel = function(model){

    // handle case of cell or cell group
    if(model.classification == "cells" || model.classification == "cellGroup"){
      // create a copy of the model to be added
      var newComponent = angular.copy(model);

      // add component if not already in the current model
      var index = getCellIndex(this.selected.cellGroups, model.name);

      if(this.selected.cellGroups.length === 0 || index === -1){
        this.selected.cellGroups.push(newComponent);
      }
    }
    // handle case of model
    else{
      // get the contents of the model and place them in a cell group
      var group = new cellGroup(model.name);
      group.cellGroups = deepCopyArray(model.cellGroups.cellGroups);
      group.description = model.description;
      this.selected.cellGroups.push(group);

      // place the synapses of the model into your model
      this.currentModel.synapses.push.apply(this.currentModel.synapses, model.synapses);
    }

    this.updateModelSession();
  };

  currentModelService.removeModel = function(model){
    // gaurantees model is not null
    if(this.displayedComponent === null)
      this.setDisplayedComponent(model);

    // clear displayed parameters data if the model being removed is the one displayed
    if (model.name == this.displayedComponent.name) {
        this.displayedComponent = null;
    }

    // remove model if found
    var myIndex = getCellIndex(this.selected.cellGroups, model.name);
    if(myIndex != -1){
      this.selected.cellGroups.splice(myIndex, 1);

      // remove any connections the model was connected to
      if(model.classification === "cells"){
        for(i=this.currentModel.synapses.length-1; i>=0; i--){
          if(this.currentModel.synapses[i].pre === model.name || this.currentModel.synapses[i].post === model.name){

            // if connection was removed, clear right panel if it was selected
            if (this.displayedComponent.classification === 'synapseGroup' && this.currentModel.synapses[i].pre === this.displayedComponent.pre &&
              this.currentModel.synapses[i].post === this.displayedComponent.post) {
                this.displayedComponent = null;
            }

            // remove the connection
            this.currentModel.synapses.splice(i, 1);
          }
        }
      }
    }

    this.updateModelSession();
  };

  currentModelService.getCurrentModel = function(){
    return this.currentModel;
  };

  currentModelService.clearCurrentModel = function(){
    // reset the current model so that it is empty
    this.currentModel = new model();

    this.breadCrumbs = [{name: "Home", index: 0}];
    this.selected = this.currentModel.cellGroups;
    this.displayedComponent = null;

    this.updateModelSession();
  };

  // bread crumb functions //////////////////////////////////////////////
  currentModelService.setComponent = function(component, index){

    // set component to sub component if a cell group is selected
    if(component.classification == "cellGroup"){
      // set current component and create breadcrumb for it
      this.breadCrumbs.push({name: component.name, index: index});
      this.selected = component;
    }
  };

  currentModelService.goHome = function(){
    this.breadCrumbs = [{name: "Home", index: 0}];
    this.selected = this.currentModel.cellGroups;
  };

  currentModelService.goToBreadCrumb = function(index){

    // go home if bread crumb index is 0
    if(index === 0)
      this.goHome();

    // if not home loop through breadcumbs to reach selected index
    else if(index < this.breadCrumbs.length){

      // go down the first layer (starts at 1 : home has a useless index)
      this.selected = this.currentModel.cellGroups.cellGroups[this.breadCrumbs[1].index];

      // go down each following layer index you hit the bread crumb index
      var setIndex;

      for(var i=2; i<=index; i++){

        // go down to the next level (components is always an array of cell groups / components[i] is a cellGroup class)
        setIndex = this.breadCrumbs[i].index;
        this.selected = this.selected.cellGroups[setIndex];
      }

      // shorten breadcrumbs to selected index
      this.breadCrumbs.splice(index+1);
    }
  };

  // get bread crumbs
  currentModelService.getBreadCrumbs = function(){
    return this.breadCrumbs;
  };

  currentModelService.getData = function(){
    return this.selected.cellGroups;
  };

  currentModelService.getParent = function(){
    return this.selected;
  };

  // end bread crumb functions ////////////////////////////////////////////

  currentModelService.setDisplayedComponent = function(component){
    this.displayedComponent = component;
  };

  currentModelService.getDisplayedComponent = function(component){
    return this.displayedComponent;
  };

  currentModelService.addSynapse = function(synapse){
    this.currentModel.synapses.push(synapse);
    this.updateModelSession();
  };

  currentModelService.getSynapses = function(){
    return this.currentModel.synapses;
  };

  currentModelService.removeSynapse = function(synapse){
    // gaurantees model is not null
    if(this.displayedComponent === null)
      this.setDisplayedComponent(synapse);

    // clear displayed parameters data if the model being removed is the one displayed
    if (this.displayedComponent.classification === 'synapseGroup' && synapse.pre === this.displayedComponent.pre &&
      synapse.post === this.displayedComponent.post) {
        this.displayedComponent = null;
    }

    // remove model if found
    var myIndex = getSynapseIndex(this.currentModel.synapses, synapse.pre, synapse.post);
    if(myIndex != -1){
      this.currentModel.synapses.splice(myIndex, 1);
    }

    this.updateModelSession();
  };

  currentModelService.loadModelFromSession();

  return currentModelService;
}]);
