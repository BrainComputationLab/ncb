// Module and dependency declarations
angular.module('ncb.model', ['restangular']);
angular.module('ncb.builder', ['ncb.model', 'mgcrea.ngStrap']);

var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    $scope.neuronTemp = {};
    $scope.root = null;
    $scope.selectedIndex = undefined;
    $scope.lastSelected = null;

    $scope.createElement = function() {
      $scope.root = model.addElement("neuron", $scope.neuronTemp);
      $scope.neuronTemp = {};
    };

    $scope.setSelectedIndex = function($index) {
      $scope.selectedIndex = $index;
      $scope.lastSelected = model.getElements().neurons[$scope.selectedIndex];
      this.selected = 'active';
    };

    $scope.output = function($index) {
      $scope.root = model.getElements();
      console.log($scope.root.neurons[0]);
      console.log($scope.root.neurons[1]);
    };

  }]);

  app.factory('model', function() {
    var root = {
      neurons: []
    };

    var addIzh = function(element) {root.neurons.push(element);};

    return {
      addElement: function(id, element){
        if(id === "neuron") {
          addIzh(element);
          return root;
        }
      },
      getElements: function() {
        return root;
      }
    };
  });