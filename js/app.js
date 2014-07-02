var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    $scope.neuronTemp = {};
    $scope.channelTemp = {};
    $scope.root = null;
    $scope.selectedIndex = undefined;
    $scope.lastSelected = null;

    $scope.createElement = function() {
      if(!_.isEmpty($scope.channelTemp)) {
        $scope.neuronTemp.channels = {};
        $scope.neuronTemp.channels.push(channelTemp);
      }
      $scope.root = model.addElement("neuron", $scope.neuronTemp);
      $scope.neuronTemp = {};
    };

    $scope.setSelectedIndex = function($index) {
      $scope.selectedIndex = $index;
      $scope.lastSelected = model.getElements().neurons[$scope.selectedIndex];
      this.selected = 'active';
    };

    $scope.resetTemp = function(name, type) {
      $scope.neuronTemp = {};
      $scope.neuronTemp.name = name;
      $scope.neuronTemp.type = type;
    };

    $scope.resetChannel = function() {
      $scope.channelTemp = {};
    };

  }]);

  app.directive('demo', ['$compile', function($compile) {
    return {
      scope: {
        demo: "="
      },
      link: function(scope, elem, attr, ctrl) {
        scope.$watch('demo', function () {
          elem.html("");

          /*jslint multistr: true */
          var template =' \
            <form class="form-horizontal" role="form"> \
              <div class="form-group"> \
                <label for="Ntype" class="col-sm-2 control-label">Channel Type</label> \
                <div class="col-sm-10"> \
                  <select id="channeltype" ng-model="channelTemp.type" class="form-control" required> \
                    <option selected></option> \
                    <option ng-click="channelChoice=\'/vgi.html\'; resetChannel();" value="vgi">"Voltage Gated Ion"</option> \
                    <option value="vg" disabled>Voltage Gated</option> \
                    <option value="cd" disabled>Calcium Dependant</option> \
                  </select> \
                </div> \
              </div> \
            </form> \
            <div ng-include src="channelChoice"> </div>';
          elem.append($compile(template)(scope));
        });
      }
    };
  }]);

  app.factory('model', function() {
    var root = {
      neurons: []
    };

    var addNeuron = function(element) {
      root.neurons.push(element);};

    return {
      addElement: function(id, element){
        if(id === "neuron") {
          addNeuron(element);
          return root;
        }
      },
      getElements: function() {
        return root;
      }
    };
  });