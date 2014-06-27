// Module and dependency declarations
angular.module('ncb.model', ['restangular']);
angular.module('ncb.builder', ['ncb.model', 'mgcrea.ngStrap']);

var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    $scope.myTemp = '<h1>Test2</h1>';
    var neuron = '<h1>Test1</h1>';
    var group = '<h1>Test2</h1>';

    $scope.placeTemplate = function(type) {
      if(type === "neuron") {
          $scope.myTemp = neuron;
      }
    };

    $scope.addIzh = function() {
      $scope.root = model.addElement(0);
    };

  }]);

  app.factory('model', function() {
    var root = {
      neurons: []
    };

    var addIzh = function(id) {root.neurons.push(id);};

    return {
      addElement: function(id){
        if(id === 0) {
          addIzh(id);
          return root;
        }
      },
      getElements: function() {
        return root;
      }
    };
  });

  app.directive('myTemplate', function() {
    return {
      template: '{{myTemp}}'
    };
  });