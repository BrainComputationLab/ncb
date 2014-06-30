// Module and dependency declarations
angular.module('ncb.model', ['restangular']);
angular.module('ncb.builder', ['ncb.model', 'mgcrea.ngStrap']);

var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    $scope.neuronTemp = {};
    $scope.root = null;
    $scope.selectedIndex = undefined;

    $scope.createElement = function() {
      console.log($scope.neuronTemp);
      $scope.root = model.addElement("neuron", $scope.neuronTemp);
      $scope.neuronTemp = {};
      console.log($scope.root.neurons[0].name);
    };

    $scope.setSelectedIndex = function($index) {
      $scope.selectedIndex = $index;
      this.selected = 'active';
      console.log($index);
    };

    $scope.test = function(id) {
      console.log(id);
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