// create side panel service
ncbApp.factory('SidePanelService', function($rootScope) {
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

  sidePanelService.goToBreadCrumb = function(index){
    // go home if bread crumb index is 0
    if(index === 0)
      this.goHome();
    else if(index < this.breadCrumbs.length){
      // if not home loop through breadcumbs to reach selected index
      this.component = this.data;
      var setIndex;
      for(var i=1; i<=index; i++){
        setIndex = this.breadCrumbs[i].index;
        this.component = this.component.cellGroups[setIndex];
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
});

// service that provides set website colors
ncbApp.factory('ColorService', function($rootScope){
  var colorService = {};

  colorService.colors = {cell: '#8781BD' , cellGroup: '#00568C', model:'#5D6B74'};

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
  };

  return colorService;
});


// service that allows the current model to be modified and accessed
ncbApp.factory('CurrentModelService', function($rootScope){
  var currentModelService = {};

  // store current model in service so it can be accessed anywhere
  currentModelService.currentModel = new model();

  currentModelService.breadCrumbs = [{name: "Home", index: 0}];
  currentModelService.selected = currentModelService.currentModel.baseCellGroups;
  currentModelService.displayedComponent = null;

  currentModelService.setName = function(name){
    this.currentModel.name = name;
  };

  currentModelService.addToModel = function(model){
    // create a copy of the model to be added
    var newComponent = deepCopy(model);

    // add component if not already in the current model
    var index = getCellIndex(this.selected.cellGroups, model.name);

    if(this.selected.cellGroups.length === 0 || index === -1){
      this.selected.cellGroups.push(newComponent);
    }
  };

  currentModelService.removeModel = function(model){

    // clear displayed parameters data if the model being removed is the one displayed
    if (model.name == currentModelService.displayedComponent.name) {
        currentModelService.displayedComponent = null;
    };

    // remove model if found
    var myIndex = getCellIndex(this.selected.cellGroups, model.name);
    if(myIndex != -1){
      this.selected.cellGroups.splice(myIndex, 1);
    }
  };

  currentModelService.getCurrentModel = function(){
    return this.currentModel;
  };

  // bread crumb functions //////////////////////////////////////////////
  currentModelService.setComponent = function(component, index){

    // set component to sub component if a cell group is selected
    if(component.classification == "cellGroup"){
      // set current component and create breadcrumb for it
      this.selected = component;
      this.breadCrumbs.push({name: component.name, index: index});
    }
  };

  currentModelService.goHome = function(){
    this.breadCrumbs = [{name: "Home", index: 0}];
    this.selected = this.currentModel.baseCellGroups;
  };

  currentModelService.goToBreadCrumb = function(index){

    // go home if bread crumb index is 0
    if(index === 0)
      this.goHome();

    // if not home loop through breadcumbs to reach selected index
    else if(index < this.breadCrumbs.length){

      // go down the first layer (starts at 1 : home has a useless index)
      this.selected = this.currentModel.baseCellGroups.cellGroups[this.breadCrumbs[1].index];

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

  // end bread crumb functions ////////////////////////////////////////////

  currentModelService.setDisplayedComponent = function(component){
    this.displayedComponent = component;
  };

  currentModelService.getDisplayedComponent = function(component){
    return this.displayedComponent;
  };

  return currentModelService;
});
