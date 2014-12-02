// controller for the model import/export drawer
ncbApp.controller("DrawerController", ['$scope', 'SidePanelService', 'ColorService', 'CurrentModelService',
  function($scope, sidePanelService, colorService, currentModelService){

  $scope.viewed = sidePanelService.getData();
  $scope.colors = colorService.getColors();
  this.tab = 0;

  this.localModels = myModels;
  this.dbModels = myDBModels;

  this.colorPickerPopover = {
      "title": "Title",
      "content": "Content"
  };

  this.selectTab = function(setTab){
    this.tab = setTab;
  };

  this.isSelected = function(checkTab){
    return this.tab === checkTab;
  };

  this.styleElement = function(model){
    // get styled component from color service
    return colorService.styleElement(model);
  };

  this.addToModel = function(model){
    currentModelService.addToModel(model);
  };

  this.quickView = function(element){
    // activate the side panel
    sidePanelService.setVisible(true);

    // pass in the data to be viewed
    $scope.viewed = element;
  };

  $scope.$watch('viewed', function (newValue) {
        if (newValue) sidePanelService.setData(newValue);
    });

}]);


// controller for the side panel preview
ncbApp.controller("SidePanelController", ['$scope', "CurrentModelService", 'SidePanelService', 'ColorService', function($scope, currentModelService, sidePanelService, colorService){
  $scope.data = sidePanelService.getData();
  $scope.colors = colorService.getColors();

  // get visibility from side panel service
  this.isSidePanelVisible = function(){
    return sidePanelService.visible;
  };

  // call this to close side panel
  this.close = function(){
    sidePanelService.setVisible(false);
  };

  this.addToModel = function(model){
    currentModelService.addToModel(model);
  };

  this.styleHeader = function(){
    var deciVal = null;
    var color = null;

    // style element based off type (cell, cell group, model)
    if ($scope.data.classification === 'cells'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt($scope.colors.cell.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        color = '#FFFFFF';
      }
      else{
        color = '#000000';
      }
      return {
                'background-color': $scope.colors.cell,
                'color': color
            };
    }
    else if ($scope.data.classification === 'cellGroup'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt($scope.colors.cellGroup.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        color = '#FFFFFF';
      }
      else{
        color = '#000000';
      }

      return {
                'background-color': $scope.colors.cellGroup,
                'color': color
            };
    }
    else if ($scope.data.classification === 'model'){
      // checks background color to make sure text is always white or black depending on the background color
      deciVal = parseInt($scope.colors.model.replace("#", ""), 16);
      if (deciVal < 8388607.5){
        color = '#FFFFFF';
      }
      else{
        color = '#000000';
      }

      return {
                'background-color': $scope.colors.model,
                'color': color
            };
    }
  };

  this.styleElement = function(model){
    // get styled component from color service
    return colorService.styleElement(model);
  };

  this.selectComponent = function(component, index){
    sidePanelService.setComponent(component, index);
  };

  // go to model home
  this.goToBreadCrumb = function(index){
    sidePanelService.goToBreadCrumb(index);
  };

  // get bread crumbs
  this.getBreadCrumbs = function(){
    return sidePanelService.breadCrumbs;
  };

    $scope.$watch(function () { return sidePanelService.getData(); }, function (newValue) {
        if (newValue){
          // update the data
          $scope.data = newValue;
        }
    });
}]);

// controller for the nav bar
ncbApp.controller("NavigationController", ['$scope', 'SidePanelService', function($scope, sidePanelService){
  // get visibility from side panel service
  this.isSidePanelVisible = function(){
    return sidePanelService.visible;
  };

  // call this to close side panel
  this.hideSidePanel = function(){
    sidePanelService.setVisible(false);
  };
}]);

// controller for add cell group modal
ncbApp.controller("AddCellGroupModalController", ['CurrentModelService', function(currentModelService){

  this.cellGroupName = "";
  this.amount = 0;
  this.cellGroupType = "cellGroup";
  this.cellType = "Izhikevich";
  this.channelType = "Voltage Gated Ion Channel";

  this.addCellGroup = function(){
    var params;

    // create cells or a cell group folder
    if(this.cellGroupType == "cells"){

      // create params based on type
      if(this.cellType == "Izhikevich")
        params = new izhikevichParam();
      else if(this.cellType == "NCS")
        params = new ncsParam();
      else
        params = new hodgkinHuxleyParam();

      currentModelService.addToModel(new cells(this.cellGroupName, this.amount, params, "Box"));
    }
    else{
      currentModelService.addToModel(new cellGroup(this.cellGroupName));
    }
  };

}]);

// controller for add connection modal
ncbApp.controller("AddConnectionModalController", ['$scope', 'CurrentModelService', 'ColorService', 
  function($scope, currentModelService, colorService){

  this.synapseCount = 0;
  $scope.editModal = false;
  $scope.selected1 = null;
  $scope.selected2 = null;
  $scope.breadCrumbs1 = currentModelService.getBreadCrumbs();
  $scope.breadCrumbs2 = currentModelService.getBreadCrumbs();
  $scope.component1 = null;
  $scope.component2 = null;

  // function to sync the modal's data
  $scope.$on('connectionModal', function(event, currentLocation1, currentLocation2, currentComponent1, currentComponent2){

    // set modal type
    if(currentComponent1 !== null)
      $scope.editModal = true;
    else
      $scope.editModal = false;

    // reset selected
    $scope.selected1 = null;
    $scope.selected2 = null;

    // sync bread crumbs
    $scope.breadCrumbs1 = currentLocation1;
    $scope.breadCrumbs2 = currentLocation2;

    // sync component
    $scope.goToBreadCrumb1(currentLocation1.length -1);
    $scope.goToBreadCrumb2(currentLocation2.length -1);

    // set selected
    if(currentComponent1 !== null){
      // loop through components at the selected level and find the selected one
      for(i=0; i<$scope.component1.cellGroups.length; i++){
        if($scope.component1.cellGroups[i].name === currentComponent1){
          $scope.selected1 = $scope.component1.cellGroups[i];
          break;
        }
      }
    }
    if(currentComponent2 !== null){
      // loop through components at the selected level and find the selected one
      for(i=0; i<$scope.component2.cellGroups.length; i++){
        if($scope.component2.cellGroups[i].name == currentComponent2){
          $scope.selected2 = $scope.component2.cellGroups[i];
          break;
        }
      }
    }
  });

  // functions to go down a level in the tree
  this.setComponent1 = function(component, index){
    if(component.classification == "cellGroup"){
      // set current component and create breadcrumb for it
      $scope.component1 = component;
      $scope.breadCrumbs1.push({name: component.name, index: index});
    }
  };

  this.setComponent2 = function(component, index){
    if(component.classification == "cellGroup"){
      // set current component and create breadcrumb for it
      $scope.component2 = component;
      $scope.breadCrumbs2.push({name: component.name, index: index});
    }
  };

  // functions to go to breadcrumb
  $scope.goToBreadCrumb1 = function(index){

    // go home if bread crumb index is 0
    if(index === 0){
      $scope.breadCrumbs1 = [{name: "Home", index: 0}];
      $scope.component1 = currentModelService.getCurrentModel().baseCellGroups;
    }

    // if not home loop through breadcumbs to reach selected index
    else if(index < $scope.breadCrumbs1.length){

      // go down the first layer (starts at 1 : home has a useless index)
      $scope.component1 = currentModelService.getCurrentModel().baseCellGroups.cellGroups[$scope.breadCrumbs1[1].index];

      // go down each following layer index you hit the bread crumb index
      var setIndex;

      for(var i=2; i<=index; i++){

        // go down to the next level (component is always an array of cell groups / component[i] is a cellGroup class)
        setIndex = $scope.breadCrumbs1[i].index;
        $scope.component1 = $scope.component1.cellGroups[setIndex];
      }

      // shorten breadcrumbs to selected index
      $scope.breadCrumbs1.splice(index+1);
    }
  };

  // functions to go to breadcrumb
  $scope.goToBreadCrumb2 = function(index){

    // go home if bread crumb index is 0
    if(index === 0){
      $scope.breadCrumbs2 = [{name: "Home", index: 0}];
      $scope.component2 = currentModelService.getCurrentModel().baseCellGroups;
    }

    // if not home loop through breadcumbs to reach selected index
    else if(index < $scope.breadCrumbs2.length){

      // go down the first layer (starts at 1 : home has a useless index)
      $scope.component2 = currentModelService.getCurrentModel().baseCellGroups.cellGroups[$scope.breadCrumbs2[1].index];

      // go down each following layer index you hit the bread crumb index
      var setIndex;

      for(var i=2; i<=index; i++){

        // go down to the next level (component is always an array of cell groups / component[i] is a cellGroup class)
        setIndex = $scope.breadCrumbs2[i].index;
        $scope.component2 = $scope.component2.cellGroups[setIndex];
      }

      // shorten breadcrumbs to selected index
      $scope.breadCrumbs2.splice(index+1);
    }
  };

  // functions to select component
  this.setSelected1 = function(component){
    $scope.selected1 = component;
  };

  this.setSelected2 = function(component){
    $scope.selected2 = component;
  };

  // function to add connection to current model
  this.addConnectionToModel = function(){

    // add connection to model if not in edit mode
    if(!$scope.editModal){
      synapse = new synapseGroup($scope.selected1.name, $scope.selected2.name, $scope.breadCrumbs1, $scope.breadCrumbs2,
       0.5, new ncsSynapse());

      currentModelService.addSynapse(synapse);
    }
    // modify selected connection if in edit mode
    else{
      var connection = currentModelService.getDisplayedComponent();
      connection.prePath = deepCopyArray($scope.breadCrumbs1);
      connection.postPath = deepCopyArray($scope.breadCrumbs2);
      connection.pre = $scope.selected1.name;
      connection.post = $scope.selected2.name;
    }
  };

  this.styleElement = function(model){
    // get styled component from color service
    return colorService.styleElement(model);
  };

}]);


// controller for add cell modal
ncbApp.controller("AddSimInputModalController", ['CurrentModelService', function(currentModelService){

  /*this.cellGroupName;
  this.amount;
  this.cellType = "Izhikevich";
  this.channelType = "Voltage Gated Ion Channel";

  this.addSimInput = function(){
    var params;

    // create params based on type
    if(this.cellType == "Izhikevich")
      params = new izhikevichParam();
    else if(this.cellType == "NCS")
      params = new ncsParam();
    else
      params = new hodgkinHuxleyParam();

    // add the cell to the current model
    currentModelService.addToModel(new cellGroup(this.cellGroupName, this.amount, this.cellType, params));
  };*/

}]);


// left panel controller (model navigation)
ncbApp.controller("ModelBuilderController", ['$rootScope', '$scope', 'CurrentModelService', 'SidePanelService', 'ColorService', 
  function($rootScope, $scope, currentModelService, sidePanelService, colorService){
  $scope.colors = colorService.getColors();

  // get visibility from side panel service
  this.isSidePanelVisible = function(){
    return sidePanelService.visible;
  };

  this.hideSidePanel = function(){
    sidePanelService.setVisible(false);
  };

  this.removeModel = function(model){
    currentModelService.removeModel(model);
  };

  this.removeSynapse = function(synapse){
    currentModelService.removeSynapse(synapse);
  };

  this.styleElement = function(model){
    // get styled component from color service
    return colorService.styleElement(model);
  };

  this.selectComponent = function(component, index){
    currentModelService.setComponent(component, index);
  };

  // get bread crumbs
  this.getBreadCrumbs = function(){
    return currentModelService.getBreadCrumbs();
  };

  // go to model home
  this.goToBreadCrumb = function(index){
    currentModelService.goToBreadCrumb(index);
  };

  this.getComponents = function(){
    return currentModelService.getData();
  };

  this.getSynapses = function(){
    return currentModelService.getSynapses();
  };

  this.updateConnectionModel = function(){
    $rootScope.$broadcast('connectionModal', deepCopyArray(currentModelService.getBreadCrumbs()), deepCopyArray(currentModelService.getBreadCrumbs()),
     null, null);
  };

  // set the cell group or cell to display in the parameters section
  this.displayParameters = function(component){
    currentModelService.setDisplayedComponent(component);
  };

  this.isConnectionVisible = function(connection){
    var crumbs = currentModelService.getBreadCrumbs();

    // if part of connection is at a higher level than current path return false
    if(connection.prePath.length < crumbs.length && connection.postPath.length < crumbs.length){
      return false;
    }

    // if connection is not within current path return false
    for(i=0; i<crumbs.length; i++){
      if((connection.prePath.length > i && connection.prePath[i].name !== crumbs[i].name) || 
        (connection.postPath.length > i && connection.postPath[i].name !== crumbs[i].name)){
        return false;
      }
    }

    return true;
  };

  this.pathString = function(path){
    var string = "";
    var i = 0;

    // show up to the last 3 breadcrumbs
    if(path.length > 3){
      string += ".../";
      i = path.length - 3;
    }

    for(i; i<path.length; i++){
      string += path[i].name;
      if(i != path.length-1){
        string += "/";
      }
    }
    return string;
  };

    /*$scope.$watch(function () { return currentModelService.getData(); }, function (newValue) {
        if (newValue){
          // update the data
          $scope.data = newValue;
        }
    });*/

}]);

// controller for the right panel that displays cell or cell group parameters
ncbApp.controller("ModelParametersController", ['$rootScope', '$scope', 'CurrentModelService', function($rootScope, $scope, currentModelService){

  $scope.synapseType = 'NCS';
  $scope.displayed = currentModelService.getDisplayedComponent();

  // param types
  $scope.types = [
    {value: "exact", text: "exact"},
    {value: "uniform", text: "uniform"},
    {value: "normal", text: "normal"}
  ];

  $scope.synapseTypes = [
    {value: "Flat", text: "Flat"},
    {value: "NCS", text: "NCS"}
  ];

  $scope.showType = function() {
    var selected = $filter('filter')($scope.statuses, {value: $scope.displayed.a.type});
    return ($scope.displayed.a.type && selected.length) ? selected[0].text : 'Not set';
  };

  // update component show if changed
  $scope.$watch(function () { return currentModelService.getDisplayedComponent(); }, function (newComponent) {

      if (newComponent){
        // update the data
        $scope.title = newComponent.name;
        $scope.displayed = newComponent;
        //$scope.displayedCrumbs = deepCopy(currentModelService.getBreadCrumbs());
      }
      else{
        // clear data being displayed
        $scope.title = "";
        $scope.displayed = null;
      }
  });

  // edit groups in connection
  $scope.editConnectionGroups = function(){
    // update and show the modal to edit groups with
    $rootScope.$broadcast('connectionModal', $scope.displayed.prePath, $scope.displayed.postPath,
     $scope.displayed.pre, $scope.displayed.post);
    $('#addConnectionModal').modal("show");
  };

  // watch to see if synapse type changes
  $scope.$watch(function () { return $scope.synapseType; }, function (newValue) {
      if($scope.displayed !== null){
        // change the sypnapse type
        if (newValue == 'Flat'){
          $scope.displayed.parameters = new flatSynapse();
        }
        else{
          $scope.displayed.parameters = new ncsSynapse();
        }
      }
  });

}]);
