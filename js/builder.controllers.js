ncbApp.controller("DrawerController", ['$scope', 'sidePanelService', 'colorService', function($scope, sidePanelService, colorService){
  $scope.viewed = sidePanelService.getData();
  $scope.colors = colorService.getColors();
  this.tab = 0;
  this.localModels = [{name: 'Cell 1', classification:'cell', type: 'Izhikevich'} ,{name: 'Cell Group 2', classification:'cellGroup'}, {name: 'Model 1', classification:'model'}, {name: 'Cell 3', classification:'cell', type: 'Izhikevich'}];
  this.dbModels = [{name: 'Cell 4', classification:'cell', type: 'Hodgkin Huxley'} ,{name: 'Cell Group 5', classification:'cellGroup'}, {name: 'Model 3', classification:'model'}, {name: 'Cell 6', classification:'cell', type: 'NCS'}];

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
    // style element based off type (cell, cell group, model)
    if (model.classification === 'cell'){
      return {
                'background-image': 'linear-gradient(left, '+$scope.colors.cell+', '+$scope.colors.cell+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.cell+', '+$scope.colors.cell+' 5%, transparent 5%, transparent 100%)',
            };
    }
    else if (model.classification === 'cellGroup'){
      return {
                'background-image': 'linear-gradient(left, '+$scope.colors.cellGroup+', '+$scope.colors.cellGroup+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.cellGroup+', '+$scope.colors.cellGroup+' 5%, transparent 5%, transparent 100%)',
            };
    }
    else if (model.classification === 'model'){
      return {
                'background-image': 'linear-gradient(left, '+$scope.colors.model+', '+$scope.colors.model+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.model+', '+$scope.colors.model+' 5%, transparent 5%, transparent 100%)',
            };
    }
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


ncbApp.controller("SidePanelController", ['$scope', 'sidePanelService', 'colorService', function($scope, sidePanelService, colorService){
  $scope.data = sidePanelService.getData();
  this.colors = colorService.getColors();

  // get visibility from side panel service
  this.isSidePanelVisible = function(){
    return sidePanelService.visible;
  };

  // call this to close side panel
  this.close = function(){
    sidePanelService.setVisible(false);
  };

  this.addToModel = function(){

  };

  this.styleElement = function(){

    // style element based off type (cell, cell group, model)
    if ($scope.data.classification === 'cell'){
      return {
        'background-color': this.colors.cell
            };
    }
    else if ($scope.data.classification === 'cellGroup'){
      return {
        'background-color': this.colors.cellGroup
            };
    }
    else if ($scope.data.classification === 'model'){
      return {
                'background-color': this.colors.model
            };
    }
  };

    $scope.$watch(function () { return sidePanelService.getData(); }, function (newValue) {
        if (newValue){
          $scope.data = newValue;
        }
    });
}]);

ncbApp.controller("NavigationController", ['$scope', 'sidePanelService', function($scope, sidePanelService){
  // get visibility from side panel service
  this.isSidePanelVisible = function(){
    return sidePanelService.visible;
  };

  // call this to close side panel
  this.hideSidePanel = function(){
    sidePanelService.setVisible(false);
  };
}]);


ncbApp.controller("ModelBuilderController", ['$scope', '$modal', 'currentModelService', 'sidePanelService', 'colorService',  
	function($scope, $modal, currentModelService, sidePanelService, colorService){
	this.currentModel = currentModelService.getCurrentModel();

	$scope.colors = colorService.getColors();

	$scope.modal = {
	  "title": "Title",
	  "content": "Hello Modal<br />This is a multiline message!"
	};

	// get visibility from side panel service
	this.isSidePanelVisible = function(){
		return sidePanelService.visible;
	};

	this.hideSidePanel = function(){
		sidePanelService.setVisible(false);
	};

	this.removeModel = function(model){
	};

	this.styleElement = function(model){
		// style element based off type (cell, cell group, model)
		if (model.classification === 'cell'){
			return {
                'background-image': 'linear-gradient(left, '+$scope.colors.cell+', '+$scope.colors.cell+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.cell+', '+$scope.colors.cell+' 5%, transparent 5%, transparent 100%)',
            };
		}
		else if (model.classification === 'cellGroup'){
			return {
                'background-image': 'linear-gradient(left, '+$scope.colors.cellGroup+', '+$scope.colors.cellGroup+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.cellGroup+', '+$scope.colors.cellGroup+' 5%, transparent 5%, transparent 100%)',
            };
		}
		else if (model.classification === 'model'){
			return {
                'background-image': 'linear-gradient(left, '+$scope.colors.model+', '+$scope.colors.model+' 5%, transparent 5%, transparent 100%)',
                'background-image': '-webkit-linear-gradient(left, '+$scope.colors.model+', '+$scope.colors.model+' 5%, transparent 5%, transparent 100%)',
            };
		}
	}
}]);
