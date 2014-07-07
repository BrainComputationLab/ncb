var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    var count = 0;
    $scope.neuronTemp = {};
    $scope.channelTemp = {};
    $scope.root = {};
    $scope.modelTemp = {};
    $scope.root.name = "Current Model";
    $scope.selectedIndex = undefined;
    $scope.selectedChanIndex = undefined;
    $scope.selectedIndexEmptyNeuron = undefined;
    $scope.lastSelected = null;
    $scope.lastChanSelected = {};
    $scope.propTemplate = undefined;
    $scope.test1 = "123";
    $scope.tempChan = {};
    var izhikevich = {name: "Empty Izhikevich"};
    var hh = {name: "Empty Hodgkin-Huxley"};
    var lif = {name: "Empty Leaky Integrate-and-Fire"};

    $scope.EmptyNeurons = [izhikevich, hh, lif];

    $scope.getName = function() {
      return $scope.root.name;
    };

    $scope.saveModelTemp = function() {
      $scope.root = model.setOther($scope.modelTemp.name, $scope.modelTemp.description, $scope.modelTemp.author);
      $scope.modelTemp = {};
    };

    $scope.removeElement = function() {
      $scope.root = model.removeElement($scope.selectedIndex, $scope.lastSelected.type);
      $scope.lastSelected = null;
      $scope.selectedIndex = undefined;
    };

    $scope.clearModelTemp = function() {
      $scope.modelTemp = {};
    };

    $scope.setSelectedIndex = function($index) {
      $scope.selectedIndex = $index;
      $scope.lastSelected = model.getElements().neurons[$scope.selectedIndex];
      if($scope.lastSelected.type === 'Izhikevich') {
        $scope.propTemplate = "izhEdit.html";
      }
      else if($scope.lastSelected.type === 'Hodgkin-Huxley') {
        $scope.propTemplate = "hhEdit.html";
      }
      else if($scope.lastSelected.type === 'Leaky Integrate-and-Fire') {
        $scope.propTemplate = "lifEdit.html";
      }
      this.selected = 'active';
    };

    $scope.setSelectedChanIndex = function($index) {
      $scope.selectedChanIndex = $index;
      $scope.lastChanSelected = model.getElements().neurons[$scope.selectedIndex].channels[$scope.selectedChanIndex];
      this.selected = 'active';
    };

    $scope.setSelectedIndexEmptyNeuron = function($index) {
      $scope.selectedIndexEmptyNeuron = $index;
      this.selected = 'active';
    };

    $scope.addEmptyNeuron = function() {
      if($scope.selectedIndexEmptyNeuron === 0) {
        $scope.neuronTemp = {name: "Izhikevich"+count, type: "Izhikevich"};
      }
      else if($scope.selectedIndexEmptyNeuron === 1) {
        $scope.neuronTemp = {name: "HH"+count, type: "Hodgkin-Huxley"};
        $scope.neuronTemp.channels = [];
      }
      else if($scope.selectedIndexEmptyNeuron === 2) {
        $scope.neuronTemp = {name: "LIF"+count, type: "Leaky Integrate-and-Fire"};
        $scope.neuronTemp.channels = [];
      }
      count++;
      $scope.root = model.addElement("neuron", $scope.neuronTemp);
      $scope.neuronTemp = {};
    };

    $scope.getPlaceholder = function(type) {
      if(type === 'exact') {
        return "Exact (real)";
      }
      else if(type === 'uniform') {
        return "Min (real) , Max (real)";
      }
      else if(type === 'normal') {
        return "Mean (real) , STDEV (real)";
      }
    };

    $scope.resetTemp = function(name, type) {
      $scope.neuronTemp = {};
      $scope.neuronTemp.name = name;
      $scope.neuronTemp.type = type;
    };

    $scope.resetChannel = function() {
      $scope.tempChan = {};
    };

    $scope.addChannel = function() {
      console.log($scope.test1);
      $scope.lastSelected.channels.push($scope.tempChan);
      $scope.tempChan = {};
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
                <label for="Ntype" class="col-sm-5 control-label">Channel Type</label> \
                <div class="col-sm-7"> \
                  <select id="channeltype" ng-model="channelTemp.type" class="form-control" required> \
                    <option selected></option> \
                    <option ng-click="channelChoice=\'/vgi.html\'; resetChannel();" value="vgi">Voltage Gated Ion</option> \
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
      name: "Current Model",
      description: "",
      author: "",
      neurons: []
    };

    var addNeuron = function(element) {
      root.neurons.push(element);
    };

    return {
      addElement: function(id, element){
        if(id === "neuron") {
          addNeuron(element);
          return root;
        }
      },
      getElements: function() {
        return root;
      },
      setOther: function(name, desc, author) {
        root.name = name;
        root.description = desc;
        root.author = author;
        return root;
      },
      removeElement: function(index, type) {
        console.log(index);
        console.log(type);
        if(type === 'Izhikevich' || 'Hodgkin-Huxley' || 'Leaky Integrate-and-Fire') {
          root.neurons.splice(index, 1);
        }
        else {

        }
        return root;
      }
    };
  });