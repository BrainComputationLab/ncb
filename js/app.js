// The whole builder tab module
var app = angular.module('builder', ['mgcrea.ngStrap']);

// The controller which handles the builder module
  app.controller('builder.controller', ['$scope', 'model', function($scope, model) {
    var count = 0; // Used for unique name generation
    $scope.myScopes = {l1: {neurons: [], groups: []}, l2: {neurons: [], groups: []}, l3: {neurons: [], groups: []}}; // Keeps track of whats in what column in the selected elements area
    $scope.myChanScope = [];
    $scope.neuronTemp = {};                           // Temporary neuron when a neuron is added to the model
    $scope.channelTemp = {};                          // Temporary channel when a channel is added to the model
    $scope.groupTemp = {};                            // Temporary group when a group is added to the model
    $scope.breadTrack = [];                           // Keeps track of breadcrumbs
    $scope.root = {};                                 // Holds the root of the model
    $scope.modelTemp = {};                            // Temporary location for current models name, description, etc
    $scope.root.name = "Current Model";               // Default name of the model
    $scope.selectedSubIndex = undefined;              // Index for what is selected in second column
    $scope.selectedSubSubIndex = undefined;           // Index for what is selected in third column
    $scope.selectedGroupIndex = undefined;            // Index for which group is selected in first column
    $scope.selectedChanIndex = undefined;             // Index for which channel is selected
    $scope.selectedIndexEmptyNeuron = undefined;      // Index for which empty element is being chosen in add element button
    $scope.propTemplate = undefined;                  // Selects template for izh, hh, or lif depending on what the user selects
    $scope.descTemplate = undefined;                  // Selects template for model Description section
    $scope.lastSelected = null;                       // Keeps track of the last selected element
    $scope.prevSelected = model.getElements().groups; // Keeps track of previously selected element
    $scope.lastChanSelected = {};                     // Keeps track of last channel selected
    $scope.loadedConnections = [];
    $scope.preChoiceIndex = undefined;
    $scope.postChoiceIndex = undefined;

    // These help select what the user clicks on in the model traversal
    $scope.select1 = null;
    $scope.select2 = null;
    $scope.select3 = null;

    var home = true;                                    // Check if first starting putting stuff in the model
    var izhikevich = {name: "Empty Izhikevich"};        // Default Izh
    var hh = {name: "Empty Hodgkin-Huxley"};            // Default HH
    var lif = {name: "Empty Leaky Integrate-and-Fire"}; // Default LIF
    var emptygroup = {name: "Empty Group"};             // Default Empty Group
    var neurongroup = {name: "Neuron Group"};           // Default Neuron Group

    $scope.emptyElements = [emptygroup, neurongroup]; // For ng-repeat in main.html

    // Function to return name of current model
    $scope.getName = function() {
      return $scope.root.name;
    };

    // Temporary function to clear last selected model to allow user to add more models if the last selected element is un-enterable
    $scope.callClick = function() {
      // First check if something is selected
      if($scope.lastSelected !== null) {
        // If selected and in first column then clear that index
        if($scope.lastSelected.level === 1) {
          $scope.selectedGroupIndex = undefined;
        }
        // If selected and in second column then clear that index
        else if($scope.lastSelected.level === 2) {
          $scope.selectedSubIndex = undefined;
        }

      }
      // Clear last selected element
      $scope.lastSelected = null;
    };

    // Save the new model name, desc, etc and then clear the temp holder
    $scope.saveModelTemp = function() {
      $scope.root = model.setOther($scope.modelTemp.name, $scope.modelTemp.description, $scope.modelTemp.author);
      $scope.modelTemp = {};
    };

    // Remove whatever is selected
    $scope.removeElement = function() {
      if($scope.lastSelected.level === 1) {
        $scope.myScopes.l1.groups.splice($scope.selectedGroupIndex, 1);
        $scope.myScopes.l2.groups = [];
        $scope.myScopes.l3.groups = [];
        $scope.root = model.removeElement($scope.selectedGroupIndex, $scope.selectedSubIndex, $scope.breadTrack);
        $scope.selectedGroupIndex = undefined;
      }
      else {
        $scope.myScopes.l2.groups.splice($scope.selectedSubIndex, 1);
        $scope.myScopes.l3.groups = [];
        $scope.root = model.removeElement($scope.selectedGroupIndex, $scope.selectedSubIndex, $scope.breadTrack);
        $scope.selectedSubIndex = undefined;
      }
      $scope.lastSelected = null;
    };

    // Clear modeltemp in case user does not want to update model name, desc, etc
    $scope.clearModelTemp = function() {
      $scope.modelTemp = {};
    };

    // Set the level of the passed elements, level 1 is elements in first column, level 2 is elements in second column. Needed for shifting over elements
    $scope.setLevel = function(id, element) {
      var x = 0;
      for(x = 0; x<element.groups.length; x++) {
        element.groups[x].level = id;
      }
    };

    // Set selected group element and load the correspond template if the group is a neuron group
    $scope.setSelectedIndex = function($index) {
      // Set the group index
      $scope.selectedGroupIndex = $index;

      $scope.selectedChanIndex = undefined;

      $scope.descTemplate = "/groupDesc.html";

      // Clear the neuron index
      $scope.selectedIndex = undefined;

      // Check if its a root group element
      if(home) {
        // If so set index corresponding to those groups
        $scope.select1 = $scope.prevSelected[$index];
      }
      else {
        // Otherwise set index from the other groups
        $scope.select1 = $scope.myScopes.l1.groups[$index];
      }

      // Set the last selected element to the corresponding element
      $scope.lastSelected = $scope.select1;

      // Load the correct template
      if($scope.lastSelected.neuron === 'Izhikevich'){
        $scope.neuronTemp = $scope.lastSelected.properties;
        $scope.propTemplate = "izhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Hodgkin-Huxley') {
        $scope.neuronTemp = $scope.lastSelected.properties;
        $scope.propTemplate = "hhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Leaky Integrate-and-Fire') {
        $scope.neuronTemp = $scope.lastSelected.properties;
        $scope.propTemplate = "lifEdit.html";
      }
      else if($scope.lastSelected.neuron === undefined) {
        $scope.neuronTemp = undefined;
        $scope.propTemplate = undefined;
      }

      // Set the second column to the sub groups of whatever the user selected
      $scope.myScopes.l2.groups = $scope.select1.groups;
      $scope.setLevel(1, $scope.myScopes.l1);

      $scope.myChanScope = $scope.lastSelected.channels;

      // Set this element to active to make it blue
      this.selected = 'active';

      $scope.myScopes.l3 = [];
      $scope.selectedSubIndex = undefined;

    };

    // Connection pre and post choice
    $scope.preChoice = function() {
      $scope.preChoiceIndex = $index;
      this.selected = 'active';
    };

    $scope.postChoice = function() {
      $scope.postChoiceIndex = $index;
      this.selected = 'active';
    };

    // Set selected group element from second column
    $scope.setSelectedSubIndex = function($index) {
      // Set the sub group index
      $scope.selectedSubIndex = $index;

      $scope.selectedChanIndex = undefined;

      $scope.descTemplate = "/groupDesc.html";

      // Set select2 and lastSelected to the selected element
      $scope.select2 = $scope.select1.groups[$index];
      $scope.lastSelected = $scope.select2;

      // Load the correct template
      if($scope.lastSelected.neuron === 'Izhikevich'){
        $scope.propTemplate = "izhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Hodgkin-Huxley') {
        $scope.propTemplate = "hhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Leaky Integrate-and-Fire') {
        $scope.propTemplate = "lifEdit.html";
      }
      else if($scope.lastSelected.neuron === undefined) {
        $scope.propTemplate = undefined;
      }

      // Set the third column to the sub groups of whatever the user selected
      $scope.myScopes.l3.groups = $scope.select2.groups;
      $scope.setLevel(2, $scope.myScopes.l2);

      $scope.myChanScope = $scope.lastSelected.channels;

      // Set this element to active to make it blue
      this.selected = 'active';
    };

    $scope.loadConnections = function(toLoad) {
      var x = 0;
      $scope.loadedConnections.push(toLoad);
      for(x; x < toLoad.groups.length; x++) {
        $scope.loadConnections(toLoad.groups[x]);
      }
    };

    // Set selected group element from third column
    $scope.setSelectedSubSubIndex = function($index) {
      // Load breadcrumb track with first column
      $scope.breadTrack.push({name: $scope.select1.name, id: $scope.selectedGroupIndex });

      $scope.descTemplate = "/groupDesc.html";

      $scope.selectedChanIndex = undefined;

      // Set the sub sub group index
      $scope.selectedSubSubIndex = $index;

      // Set select3 and lastSelected to the selected element
      $scope.select3 = $scope.select2.groups[$index];
      $scope.lastSelected = $scope.select3;

      // Load the correct template
      if($scope.lastSelected.neuron === 'Izhikevich'){
        $scope.propTemplate = "izhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Hodgkin-Huxley') {
        $scope.propTemplate = "hhEdit.html";
      }
      else if($scope.lastSelected.neuron === 'Leaky Integrate-and-Fire') {
        $scope.propTemplate = "lifEdit.html";
      }
      else if($scope.lastSelected.neuron === undefined) {

      }

      // Shift the third column to the second column, the second column to the first column, and clear the third column
      $scope.myScopes.l1.neurons = [];
      $scope.myScopes.l1.groups = $scope.select1.groups;
      $scope.myScopes.l2.groups = $scope.select2.groups;
      $scope.myScopes.l3.groups = $scope.select3.groups;

      // Update the indexes to correspong to the new columns choices
      $scope.select1 = $scope.myScopes.l1.groups[$scope.selectedSubIndex];
      $scope.select2 = $scope.myScopes.l2.groups[$scope.selectedSubSubIndex];
      $scope.selectedGroupIndex = $scope.selectedSubIndex;
      $scope.selectedSubIndex = $scope.selectedSubSubIndex;

      // Update the levels of everything
      $scope.setLevel(1, $scope.myScopes.l1);
      $scope.setLevel(2, $scope.myScopes.l2);

      // Update home since the first column is not the root column
      home = false;

      // Clear column3 index
      $scope.selectedSubSubIndex = undefined;

      $scope.myChanScope = $scope.lastSelected.channels;

      // Set this element to active to make it blue
      this.selected = 'active';
    };

    // Function for handeling breadcrumbs
    $scope.handleBreadcrumbs = function($index) {
      // Get the groups from current model
      var group = model.getElements().groups;

      $scope.selectedChanIndex = undefined;

      // Loop to the correct group 
      var x = 0;
      for(x = 0; x < $index; x++) {
        group = group[$scope.breadTrack[x].id].groups;
      }

      // Remove every breadcrumb after what was chosen
      $scope.breadTrack.splice($index, $scope.breadTrack.length - $index);

      // Reset the first column to what the user selected
      $scope.myScopes.l1.groups = group;
      $scope.setLevel(1, $scope.myScopes.l1);
      $scope.select1 = $scope.myScopes.l1.groups[$index];

      // Clear the second and third columns and clear all the indexes
      $scope.myScopes.l2.groups = {};
      $scope.myScopes.l3.groups = {};
      $scope.selectedGroupIndex = undefined;
      $scope.selectedSubIndex = undefined;
      $scope.selectedSubSubIndex = undefined;
    };

    $scope.setSelectedChanIndex = function($index) {
      $scope.selectedChanIndex = $index;
      $scope.lastChanSelected = $scope.lastSelected.channels[$index];
      this.selected = 'active';

      $scope.channelTemp = $scope.lastSelected.channels[$index];

      if($scope.lastSelected.channels[$index].type === "vgi") {
        $scope.propTemplate = "/vgi.html";
      }
      else if($scope.lastSelected.channels[$index].type === "vg") {
        $scope.propTemplate = "/vg.html";
      }
      if($scope.lastSelected.channels[$index].type === "cd") {
        $scope.propTemplate = "/cd.html";
      }
    };

    $scope.setSelectedIndexEmptyNeuron = function($index) {
      $scope.selectedIndexEmptyNeuron = $index;
      this.selected = 'active';
    };

    $scope.setPreview = function(value) {
      if(value === "Izhikevich") {
        $scope.previewTemp = "izhEdit.html";
      }
      else if(value === "Hodgkin-Huxley") {
        $scope.previewTemp = "hhEdit.html";
      }
      else if(value === "Leaky Integrate-and-Fire") {
        $scope.previewTemp = "lifEdit.html";
      }
    };

    $scope.addEmptyElement = function() {
      if($scope.lastSelected !== null) {
        if($scope.lastSelected.enterable) {
          if($scope.selectedIndexEmptyNeuron === 0) {
            if($scope.lastSelected.level === 1) {
              $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 2, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l2.groups = $scope.lastSelected.groups;
            }
            if($scope.lastSelected.level === 2) {
              $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 3, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l3.groups = $scope.lastSelected.groups;
            }
            if($scope.lastSelected.level === 3) {
              $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 1, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l1.groups = $scope.lastSelected.groups;
            }
          }
          else if($scope.selectedIndexEmptyNeuron === 1) {
            if($scope.lastSelected.level === 1) {
              $scope.groupTemp = {name: "Empty "+$scope.groupTemp.neuron+"Group"+count, neuron: $scope.groupTemp.neuron, amount: $scope.groupTemp.amount, type: "none", enterable: false, level: 2, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l2.groups = $scope.lastSelected.groups;
            }
            else if($scope.lastSelected.level === 2) {
              $scope.groupTemp = {name: "Empty "+$scope.groupTemp.neuron+" Group"+count, neuron: $scope.groupTemp.neuron, amount: $scope.groupTemp.amount, type: "none", enterable: false, level: 3, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l3.groups = $scope.lastSelected.groups;
            }
            else if($scope.lastSelected.level === 3) {
              $scope.groupTemp = {name: "Empty "+$scope.groupTemp.neuron+" Group"+count, neuron: $scope.groupTemp.neuron, amount: $scope.groupTemp.amount, type: "none", enterable: false, level: 1, groups: []};
              $scope.lastSelected.groups.push($scope.groupTemp);
              $scope.myScopes.l1.groups = $scope.lastSelected.groups;
            }
          }
        }
      }
      else {
        if($scope.selectedIndexEmptyNeuron === 0) {
          $scope.groupTemp = {name: "Empty Group"+count, type: "none", enterable: true, level: 1, groups: []};
          $scope.root = model.addGroup($scope.groupTemp);
          $scope.myScopes.l1.groups.push($scope.groupTemp);
        }
        else if($scope.selectedIndexEmptyNeuron === 1) {
          $scope.groupTemp = {name: "Empty "+$scope.groupTemp.neuron+" Group"+count, neuron: $scope.groupTemp.neuron, amount: $scope.groupTemp.amount, type: "none", enterable: false, level: 1};
          $scope.root = model.addGroup($scope.groupTemp);
          $scope.myScopes.l1.groups.push($scope.groupTemp);
        }
      }
      count++;
      $scope.groupTemp = {};
      $scope.resetTemp();
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
      $scope.selectedIndexEmptyNeuron = undefined;
    };

    $scope.resetChannel = function() {
      $scope.channelTemp = {};
    };

    $scope.addChannel = function() {
      if($scope.lastSelected.channels === undefined) {
        $scope.lastSelected.channels = [];
      }

      if($scope.lastSelected.neuron === "Izhikevich") {
        alert("You cannot add a channel to an Izhikevich neuron.");
      }
      else {
        $scope.lastSelected.channels.push($scope.channelTemp);
        $scope.myChanScope = $scope.lastSelected.channels;
        $scope.channelTemp = {};
      }
    };

    $scope.addConnection = function() {

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
      removeElement: function(index0, index1, indexes) {
        var removedElement = root.groups;
        var x = 0;
        if(indexes.id !== undefined) {
          while(indexes[x].id !== undefined) {
            removedElement = removedElement[indexes[x]].groups;
            x++;
          }
        }

        if(index1 !== undefined) {
          removedElement = removedElement[index0].groups;
          removedElement.splice(index1, 1);
        }
        else {
          removedElement.splice(index0, 1);
        }

        return root;
      }
    };
  });