// create side panel service
ncbApp.factory('sidePanelService', function($rootScope) {
  var sidePanelService = {};

  sidePanelService.visible = false;
  sidePanelService.data = {name: 'Name', classification:'cell'};

  sidePanelService.setVisible = function(isVisible) {
    this.visible = isVisible;
  };

  sidePanelService.setData = function(newData){
    this.data = newData;
  };

  sidePanelService.getData = function(){
    return this.data;
  };

  return sidePanelService;
});

ncbApp.factory('colorService', function($rootScope){
  var colorService = {};

  colorService.colors = {cell: '#8781BD' , cellGroup: '#00568C', model:'#5D6B74'};

  colorService.getColors = function(){
    return this.colors;
  };

  colorService.setColors = function(newColors){
    this.colors = newColors;
  };

  return colorService;
});

ncbApp.factory('currentModelService', function($rootScope){
  var currentModelService = {};

  // store current model in service so it can be accessed anywhere
  this.currentModel = new currentWorkingModel();

  currentModelService.addToModel = function(model){
    this.currentModel.insert(model);
  };

  currentModelService.getCurrentModel = function(){
    return this.currentModel;
  };

  return currentModelService;
});
