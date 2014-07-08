var app = angular.module('builder', ['mgcrea.ngStrap']);

  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    var count = 0;
    $scope.myScopes = {l1: {neurons: [], groups: []}, l2: {neurons: [], groups: []}, l3: {neurons: [], groups: []}};
    $scope.neuronTemp = {};
    $scope.channelTemp = {};
    $scope.groupTemp = {};
    $scope.nextGroup = {};
    $scope.breadTrack = [];
    $scope.root = {};
    $scope.modelTemp = {};
    $scope.root.name = "Current Model";
    $scope.selectedIndex = undefined;
    $scope.selectedSubIndex = undefined;
    $scope.selectedSubSubIndex = undefined;
    $scope.selectedGroupIndex = undefined;
    $scope.selectedChanIndex = undefined;
    $scope.selectedIndexEmptyNeuron = undefined;
    $scope.propTemplate = undefined;
    $scope.lastSelected = null;
    $scope.nextSelected = null;
    $scope.prevSelected = null;
    $scope.prevprevSelected = null;
    $scope.nextnextSelected = null;
    $scope.lastChanSelected = {};

    var home = true;
    var izhikevich = {name: "Empty Izhikevich"};
    var hh = {name: "Empty Hodgkin-Huxley"};
    var lif = {name: "Empty Leaky Integrate-and-Fire"};
    var emptygroup = {name: "Empty Group"};
    var neurongroup = {name: "Neuron Group"};

    $scope.emptyElements = [izhikevich, hh, lif, emptygroup, neurongroup];

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

    $scope.setSelectedNeuronIndex = function($index) {
      $scope.selectedIndex = $index;
      $scope.selectedGroupIndex = undefined;
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
      $scope.myScopes.l2.groups = [];
      $scope.myScopes.l3.groups = [];
    };

    $scope.setSelectedGroupIndex = function($index) {
      $scope.selectedGroupIndex = $index;
      if(home) {
        $scope.lastSelected = model.getElements().groups[$scope.selectedGroupIndex];
        $scope.myScopes.l1.groups = model.getElements().groups;
      }
      else {
        if($scope.nextnextSelected !== null) { $scope.lastSelected = $scope.nextnextSelected.groups[$scope.selectedSubSubIndex]; console.log($scope.lastSelected); }
        $scope.nextnextSelected = null;
        $scope.nextSelected = null;
        console.log($scope.lastSelected);
      }

      $scope.selectedIndex = undefined;
      $scope.selectedSubIndex = undefined;
      $scope.selectedSubSubIndex = undefined;


      $scope.myScopes.l2.groups = $scope.lastSelected.groups;
      $scope.myScopes.l3.groups = [];
      this.selected = 'active';
      console.log($scope.lastSelected);
    };

    $scope.setSelectedSubIndex = function($index) {
      if($scope.nextSelected !== null) {
        if($scope.lastSelected.level === $scope.nextSelected.level) {
          $scope.lastSelected = $scope.prevSelected;
        }
      }
      $scope.prevprevSelected = $scope.lastSelected;
      $scope.selectedSubIndex = $index;
      $scope.nextSelected = $scope.lastSelected.groups[$index];
      $scope.myScopes.l1.groups = $scope.prevprevSelected.groups;
      $scope.myScopes.l3.groups = $scope.nextSelected.groups;
      this.selected = 'active';
      console.log($scope.lastSelected);
    };

    $scope.setSelectedSubSubIndex = function($index) {
      $scope.selectedSubSubIndex = $index;
      $scope.prevSelected = $scope.lastSelected;
      $scope.lastSelected = $scope.nextSelected;
      $scope.nextnextSelected = $scope.lastSelected.groups[$index];
      $scope.myScopes.l1.groups = $scope.nextnextSelected.groups;
      this.selected = 'active';
      console.log($scope.lastSelected);
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

    $scope.addEmptyElement = function() {
      if($scope.selectedIndexEmptyNeuron === 0) {
        $scope.neuronTemp = {name: "Izhikevich"+count, type: "Izhikevich"};
        $scope.root = model.addNeuron($scope.neuronTemp);
        $scope.myScopes.l1.neurons.push($scope.neuronTemp);
      }
      else if($scope.selectedIndexEmptyNeuron === 1) {
        $scope.neuronTemp = {name: "HH"+count, type: "Hodgkin-Huxley"};
        $scope.neuronTemp.channels = [];
        $scope.root = model.addNeuron($scope.neuronTemp);
        $scope.myScopes.l1.neurons.push($scope.neuronTemp);
      }
      else if($scope.selectedIndexEmptyNeuron === 2) {
        $scope.neuronTemp = {name: "LIF"+count, type: "Leaky Integrate-and-Fire"};
        $scope.neuronTemp.channels = [];
        $scope.root = model.addNeuron($scope.neuronTemp);
        $scope.myScopes.l1.neurons.push($scope.neuronTemp);
      }
      if($scope.lastSelected !== null) {
        if($scope.lastSelected.enterable) {
          if($scope.selectedIndexEmptyNeuron === 3) {
            var temp = $scope.lastSelected;
            if($scope.nextnextSelected !== null) {$scope.lastSelected = $scope.nextnextSelected; $scope.selectedGroupIndex = undefined;}
            else if($scope.nextSelected !== null) {$scope.lastSelected = $scope.nextSelected;}
            if($scope.lastSelected.level === 1) { $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 2, groups: []}; $scope.lastSelected.groups.push($scope.groupTemp); $scope.myScopes.l2.groups = $scope.lastSelected.groups;}
            if($scope.lastSelected.level === 2) { $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 3, groups: []}; $scope.lastSelected.groups.push($scope.groupTemp); $scope.myScopes.l3.groups = $scope.lastSelected.groups;}
            if($scope.lastSelected.level === 3) { $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 1, groups: []}; home = false; $scope.lastSelected.groups.push($scope.groupTemp); $scope.myScopes.l1.groups = $scope.lastSelected.groups;}
            $scope.lastSelected = temp;
          }
          else if($scope.selectedIndexEmptyNeuron === 4) {
            $scope.groupTemp = {name: "Empty Neuron Group"+count, type: "none", enterable: false};
            $scope.lastSelected.groups.push($scope.groupTemp);
            $scope.myScopes.l1.groups.push($scope.groupTemp);
          }
        }
      }
      else {
        if($scope.selectedIndexEmptyNeuron === 3) {
          $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 1, groups: []};
          $scope.root = model.addGroup($scope.groupTemp);
          $scope.myScopes.l1.groups.push($scope.groupTemp);
        }
        else if($scope.selectedIndexEmptyNeuron === 4) {
          $scope.groupTemp = {name: "Empty Neuron Group"+count, type: "none", enterable: false, level: 1};
          $scope.root = model.addGroup($scope.groupTemp);
          $scope.myScopes.l1.groups.push($scope.groupTemp);
        }
      }
      count++;
      $scope.neuronTemp = {};
      $scope.groupTemp = {};
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
      $scope.channelTemp = {};
    };

    $scope.addChannel = function() {
      $scope.lastSelected.channels.push($scope.channelTemp);
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
      neurons: [],
      groups: []
    };

    return {
      addNeuron: function(element){
        root.neurons.push(element);
        return root;
      },
      addGroup: function(element) {
        root.groups.push(element);
        return root;
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
        if(type === 'Izhikevich' || 'Hodgkin-Huxley' || 'Leaky Integrate-and-Fire') {
          root.neurons.splice(index, 1);
        }
        else if(type === 'none') {
          root.groups.splice(index, 1);
        }
        return root;
      }
    };
  });