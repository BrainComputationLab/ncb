//test models
var testChannel1 = new voltageGatedIonChannel();
var testChannel2 = new calciumDependantChannel();
var testParam = new izhikevichParam();
var test2Param = new ncsParam();
test2Param.channel[0] = cloneChan(testChannel1);
var test3Param = new hodgkinHuxleyParam();
test3Param.channel[0] = cloneChan(testChannel1);
var a1 = new particleVariableConstants();
var b1 = new particleVariableConstants();
var testParticle = new voltageGatedParticle(a1, b1);
var testChannel3 = new voltageGatedChannel(testParticle);
var test4Param = new hodgkinHuxleyParam();
test4Param.channel[0] = cloneChan(testChannel3);
var flatS = new flatSynapse();
var ncsS = new ncsSynapse();

var myModels = [
    new modelParameters('I_Cell_1', 'Izhikevich', cloneParam(testParam), 'Database'),
    new modelParameters('I_Cell_2', 'Izhikevich', cloneParam(testParam), 'Personal'),
    new modelParameters('I_Cell_3', 'Izhikevich', cloneParam(testParam), 'Personal'), 
    new modelParameters('I_Cell_4', 'Izhikevich', cloneParam(testParam), 'Database'),
    new modelParameters('I_Cell_5', 'Izhikevich', cloneParam(testParam), 'Personal'),
    new modelParameters('NCS_Cell_1', 'NCS', cloneParam(test2Param), 'Personal'),
    new modelParameters('HH_Cell_1', 'HodgkinHuxley', cloneParam(test3Param), 'Database'),
    new modelParameters('HH_Cell_3_testparticles', 'HodgkinHuxley', cloneParam(test4Param), 'Personal'),
];



// variables needed for implementation
var inc = 0;
var pos = 0;
var value = 0;
var index1 = 0;
var index = 0;
var indexs = [];
var breadDepth = 1;
var globalCellGroup = [];
var globalCellAlias = [];
var globalSynapseGroup = [];
var dynamicChanNum = 0;
var dynamicSynNum = 0;
var leftMenuLast = {};
var midMenuLast = {};
var cellGroupLast = {};
var aliasid = 0;
var aliasVals = [];
var aliasVal = 0;
var synapseChoice = 1;
var prePost = [null, null];
var lasSelectSynapse = null;

var currentModel = new currentWorkingModel();
var indexes = [];

var ncbApp = angular.module('ncbApp', ['ui.bootstrap', 'mgcrea.ngStrap', 'mgcrea.ngStrap.tooltip', 'colorpicker.module']);

//scope for models in the left menu
function myModelsList($scope) {
    //set the scope to point at myModels
    $scope.list = myModels;

	//set default colors for model list
	$scope.model_color = {personal:'#00568C', database:'#5d6b74'};

    // handles different color config styles
    $scope.options = [
        { label: 'Complete Color', value: 1 },
        { label: 'Partial Color', value: 2 }
    ];

    // part of color config styles
    $scope.selected = $scope.options[0];
    $scope.data = {selected:$scope.selected}

    //sets the leftMenuLast model to the last model the user clicks on
    $scope.setModel = function (model){
        var result = $.grep(myModels, function(e){ return e.name == model; });
        leftMenuLast = {};
        clone(leftMenuLast, result[0]);
    };

    //when the user dblclicks or drags the model from the left menu to the right menu, it pushes the model into the cellgroup variable which represents the center menu.
    $scope.moveModel = function (model) {
        var result = $.grep(myModels, function(e){ return e.name == model; });
        var sub = [];
        //$('#synCollapse').show();

        if(result[0].className === "neuron") {
            currentModel.neurons.push({name: "neuron"+inc, type: result[0].type, parameters: cloneParam(result[0].parameters), dbType: 'Personal'});
        }
        else if(result[0].className === "cellGroup") {

        }
        else if(result[0].className === "cellAlias") {

        }
        inc++;
    };


    // changes color of model depending on if from personal or database also depending on different style configuration
	$scope.styleModel = function(dbType, color) {
    if(dbType == "Personal")        
        if ($scope.data.selected.value == 2) {
            return {

                    'width':'223px',
                    'height':'42px',
                    'background-image': 'linear-gradient(left, '+color.personal+', '+color.personal+' 5%, transparent 5%, transparent 100%)',
                    'background-image': '-webkit-linear-gradient(left, '+color.personal+', '+color.personal+' 5%, transparent 5%, transparent 100%)',
                    'color': color.personal

            };
        }
        else{
            return {
                    
                    'color': '#FFFFFF',
                    'background-color': color.personal
            };

        }
    else if(dbType == "Database")
        if ($scope.data.selected.value == 2) {

            return {

                    'width':'223px',
                    'height':'42px',
                    'background-image': 'linear-gradient(left, '+color.database+', '+color.database+' 5%, transparent 5%, transparent 100%)',
                    'background-image': '-webkit-linear-gradient(left, '+color.database+', '+color.database+' 5%, transparent 5%, transparent 100%)',
                    'color': color.database

            };
        }
        else{
            return {
                    
                    'color': '#FFFFFF',
                    'background-color': color.database
            };

        }


	};

	// returns the path for the correct poopover template depending on cell type
	$scope.getTemplate = function(modelType){
		if(modelType == "Izhikevich")
			return "assets/html/izhik-popover.html";
		else if (modelType == "NCS")
			return "assets/html/ncs-popover.html";
		else if (modelType == "HodgkinHuxley")
			return "assets/html/hh-popover.html";

	};


    
	// needed for color picker popover to appear with html template
	$scope.colorPickerPopover = {
  		"title": "Title",
  		"content": "Content"
	};

	$scope.modelPopover ={
		"title": "Title",
		"content": "Content"
    };


}

//scope for the cellgroups in the center menu
function myModelsList2($scope, $compile) {
    $scope.list = globalCellGroup;
    $scope.list2 = currentModel;
    console.log("SCOPE");

    $scope.setModel = function (model, num1){
        hideAll();
        if(num1 == 0) {
            var result = $.grep(currentModel.neurons, function(e){return e.name == model; });
            midMenuLast = {};
            midMenuLast = result[0];
            midMenuLast.className = "neuron";
            index = getIndex(currentModel.neurons, "name", midMenuLast.name);
            popModelP();
            $("#cellGroupCollapse").hide();
            return;
        }
        else if(num1 === 1){
            if(pos != 0) {
                var moveInto = currentModel.cellGroups[indexes[0]];
                for(i=1; i<pos; i++) {
                    if(moveInto.cellGroups.length != 0) {
                        moveInto = moveInto.cellGroups[indexes[i]];
                    }
                }
                // console.log(moveInto)
                var result = $.grep(moveInto.cellGroups, function(e){return e.name == model; }); 
                cellGroupLast = {};
    	        cellGroupLast = result[0];
    	        index = getIndex(moveInto.cellGroups, "name", cellGroupLast.name);
            }
            else {
                var result = $.grep(currentModel.cellGroups, function(e){return e.name == model; }); 
                cellGroupLast = {};
            	cellGroupLast = result[0];
            	index = getIndex(currentModel.cellGroups, "name", cellGroupLast.name);
            }
            midMenuLast = cellGroupLast.modelParameters;

            popCellP();
            popModelP();

            $("#cellGroupCollapse").show();
            return;
        }
       
    };
    
    // when the user double clicks on a cellgroup it should set the scope to that cellgroups subgroup.
    $scope.intoModel = function (num1){
        pos += 1;
        indexes.push(index);
        var myStr = $compile('<li><a id="' + breadDepth + '" class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + cellGroupLast.name + '</a></li>')($scope);
/*
        for(i=1; i<pos-5; i++) {
            if(cellGroupLast.cellGroups.length != 0) {
                cellGroupLast = cellGroupLast.cellGroups[indexes[i]];
                console.log(cellGroupLast);
            }
        }
*/
        $('#bread').append(myStr);
        breadDepth += 1;

        //console.log(cellGroupLast)
        $scope.list2 = cellGroupLast;
    };

    // when the user clicks on home it erases the breadcrumbs and resets the scope to the home level
    $scope.breadGoHome = function (event) {
        pos = 0;
        breadDepth = 1;
        indexes.length = 0;

        $('#bread').html('');
        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);
        $('#bread').append(myStr);

        $scope.list2 = currentModel;
    };

    $scope.changeBreadcrumb = function (event) {
        breadDepth = +event.target.id + 1;
        pos = +event.target.id;

        $('#bread').html('');

        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);

        $('#bread').append(myStr);

        var depth = 1;

        var moveInto = currentModel;
        for(var i=0; i<breadDepth-1; i++) {
            //var name = moveInto.name;
            moveInto = moveInto.cellGroups[indexes[i]];
            var name = moveInto.name;
            //console.log(breadDepth)
            var myStr2 = $compile('<li><a id="' + depth + '"class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + name + '</a></li>')($scope);
            $('#bread').append(myStr2);
            depth += 1;
        }

        indexes.length = breadDepth - 1;

        $scope.list2 = moveInto;        
    };

}

function popCellP() {
    //$('#cellGroupCollapse').show();
    //$('#synCollapse').show();

    $('#cellGroupParams').html('');
    $("#cellGroupParams").append('<a id="n1" class="list-group-item">' + cellGroupLast.name +'</a>');
    $("#cellGroupParams").append('<a id="n3" class="list-group-item">' + cellGroupLast.num +'</a>');
    $("#cellGroupParams").append('<a id="n4" class="list-group-item">' + cellGroupLast.geometry +'</a>');
    $('#cellGroupParams a').editable({
        'success': function(response, newValue) {
                        if(this.id == "n1") { cellGroupLast.name = newValue; }
                        if(this.id == "n3") { cellGroupLast.num = newValue; }
                        if(this.id == "n4") { cellGroupLast.geometry = newValue; }
                    }
    });
}

function popModelP() {
    showParameterNames();
    var dropChoice = [{ 'value': 0, 'text': 'exact' }, { 'value': 1, 'text': 'uniform' }, { 'value': 2, 'text': 'normal' }];
    var dropChoice2 = [{ 'value': 0, 'text': 'Voltage Gated Ion Channel' }, {'value': 1, 'text': "Calcium Dependant Channel" }, {'value': 2, 'text': "Voltage Gated Channel" }];

    $('#name a').editable({
        'success': function(response, newValue) {
                        if(midMenuLast.className === "neuron") {
                            if(this.id === "n11") {midMenuLast.name = newValue;};
                        }
                        else if(midMenuLast.className === "cellGroup") {

                        }
                    }
    });
    $('#type2 a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.type === "Izhikevich") {
                                if(this.id === "a1") { midMenuLast.parameters.a.type = dropChoice[newValue].text; }
                                if(this.id === "b1") { midMenuLast.parameters.b.type = dropChoice[newValue].text; }
                                if(this.id === "c1") { midMenuLast.parameters.c.type = dropChoice[newValue].text; }
                                if(this.id === "d1") { midMenuLast.parameters.d.type = dropChoice[newValue].text; }
                                if(this.id === "u1") { midMenuLast.parameters.u.type = dropChoice[newValue].text; }
                                if(this.id === "v1") { midMenuLast.parameters.v.type = dropChoice[newValue].text; }
                                if(this.id === "t1") { midMenuLast.parameters.threshold.type = dropChoice[newValue].text; }
                            }
                            else if(midMenuLast.type === "NCS") {
                                if(this.id === "a1") { midMenuLast.parameters.threshold.type = dropChoice[newValue].text; }
                                if(this.id === "b1") { midMenuLast.parameters.restingPotential.type = dropChoice[newValue].text; }
                                if(this.id === "c1") { midMenuLast.parameters.calcium.type = dropChoice[newValue].text; }
                                if(this.id === "d1") { midMenuLast.parameters.calciumSpikeIncrement.type = dropChoice[newValue].text; }
                                if(this.id === "e1") { midMenuLast.parameters.tauCalcium.type = dropChoice[newValue].text; }
                                if(this.id === "f1") { midMenuLast.parameters.leakReversalPotential.type = dropChoice[newValue].text; }
                                if(this.id === "g1") { midMenuLast.parameters.tauMembrane.type = dropChoice[newValue].text; }
                                if(this.id === "h1") { midMenuLast.parameters.rMembrane.type = dropChoice[newValue].text; }
                                if(this.id === "i1") { midMenuLast.parameters.spikeShape.type = dropChoice[newValue].text; }
                            }
                            else if(midMenuLast.type === "HodgkinHuxley") {
                                if(this.id === "a1") { midMenuLast.parameters.threshold.type = dropChoice[newValue].text; }
                                if(this.id === "b1") { midMenuLast.parameters.restingPotential.type = dropChoice[newValue].text; }
                                if(this.id === "c1") { swmidMenuLast.parameters.capacitence.type = dropChoice[newValue].text; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
                   }
    });
    $('#value a').editable({
        'success': function(response, newValue) {
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.type === "Izhikevich") {
                                if(this.id === "a2") { midMenuLast.parameters.a.value = newValue; }
                                if(this.id === "b2") { midMenuLast.parameters.b.value = newValue; }
                                if(this.id === "c2") { midMenuLast.parameters.c.value = newValue; }
                                if(this.id === "d2") { midMenuLast.parameters.d.value = newValue; }
                                if(this.id === "u2") { midMenuLast.parameters.u.value = newValue; }
                                if(this.id === "v2") { midMenuLast.parameters.v.value = newValue; }
                                if(this.id === "t2") { midMenuLast.parameters.threshold.value = newValue; }
                            }
                            else if(midMenuLast.type === "NCS") {
                                if(this.id === "a2") { midMenuLast.parameters.threshold.value = newValue; }
                                if(this.id === "b2") { midMenuLast.parameters.restingPotential.value = newValue; }
                                if(this.id === "c2") { midMenuLast.parameters.calcium.value = newValue; }
                                if(this.id === "d2") { midMenuLast.parameters.calciumSpikeIncrement.value = newValue; }
                                if(this.id === "e2") { midMenuLast.parameters.tauCalcium.value = newValue; }
                                if(this.id === "f2") { midMenuLast.parameters.leakReversalPotential.value = newValue; }
                                if(this.id === "g2") { midMenuLast.parameters.tauMembrane.value = newValue; }
                                if(this.id === "h2") { midMenuLast.parameters.rMembrane.value = newValue; }
                                if(this.id === "i2") { midMenuLast.parameters.spikeShape.value = newValue; }
                            }
                            else if(midMenuLast.type === "HodgkinHuxley") {
                                if(this.id === "a2") { midMenuLast.parameters.threshold.value = newValue; }
                                if(this.id === "b2") { midMenuLast.parameters.restingPotential.value = newValue; }
                                if(this.id === "c2") { midMenuLast.parameters.capacitence.value = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
                   }
    });
    $('#minvalue a').editable({
        'success': function(response, newValue) {
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.type === "Izhikevich") {
                                if(this.id == "a3") { midMenuLast.parameters.a.minValue = newValue; }
                                if(this.id == "b3") { midMenuLast.parameters.b.minValue = newValue; }
                                if(this.id == "c3") { midMenuLast.parameters.c.minValue = newValue; }
                                if(this.id == "d3") { midMenuLast.parameters.d.minValue = newValue; }
                                if(this.id == "u3") { midMenuLast.parameters.u.minValue = newValue; }
                                if(this.id == "v3") { midMenuLast.parameters.v.minValue = newValue; }
                                if(this.id == "t3") { midMenuLast.parameters.threshold.minValue = newValue; }
                            }
                            else if(midMenuLast.type === "NCS") {
                                if(this.id == "a3") { midMenuLast.parameters.threshold.minValue = newValue; }
                                if(this.id == "b3") { midMenuLast.parameters.restingPotentminValueial.minValue = newValue; }
                                if(this.id == "c3") { midMenuLast.parameters.calcium.minValue = newValue; }
                                if(this.id == "d3") { midMenuLast.parameters.calciumSpikeIncrement.minValue = newValue; }
                                if(this.id == "e3") { midMenuLast.parameters.tauCalcium.minValue = newValue; }
                                if(this.id == "f3") { midMenuLast.parameters.leakReversalPotential.minValue = newValue; }
                                if(this.id == "g3") { midMenuLast.parameters.tauMembrane.minValue = newValue; }
                                if(this.id == "h3") { midMenuLast.parameters.rMembrane.minValue = newValue; }
                                if(this.id == "i3") { midMenuLast.parameters.spikeShape.minValue = newValue; }
                            }
                            else if(midMenuLast.type === "HodgkinHuxley") {
                                if(this.id == "a3") { midMenuLast.parameters.threshold.minValue = newValue; }
                                if(this.id == "b3") { midMenuLast.parameters.restingPotential.minValue = newValue; }
                                if(this.id == "c3") { midMenuLast.parameters.capacitence.minValue = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
                   }
    });
    $('#maxvalue a').editable({
        'success': function(response, newValue) {
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.type === "Izhikevich") {
                                if(this.id == "a4") { midMenuLast.parameters.a.maxValue = newValue; }
                                if(this.id == "b4") { midMenuLast.parameters.b.maxValue = newValue; }
                                if(this.id == "c4") { midMenuLast.parameters.c.maxValue = newValue; }
                                if(this.id == "d4") { midMenuLast.parameters.d.maxValue = newValue; }
                                if(this.id == "u4") { midMenuLast.parameters.u.maxValue = newValue; }
                                if(this.id == "v4") { midMenuLast.parameters.v.maxValue = newValue; }
                                if(this.id == "t4") { midMenuLast.parameters.threshold.maxValue = newValue; }
                            }
                            else if(midMenuLast.type === "NCS") {
                                if(this.id == "a4") { midMenuLast.parameters.threshold.maxValue = newValue; }
                                if(this.id == "b4") { midMenuLast.parameters.restingPotentminValueial.maxValue = newValue; }
                                if(this.id == "c4") { midMenuLast.parameters.calcium.maxValue = newValue; }
                                if(this.id == "d4") { midMenuLast.parameters.calciumSpikeIncrement.maxValue = newValue; }
                                if(this.id == "e4") { midMenuLast.parameters.tauCalcium.maxValue = newValue; }
                                if(this.id == "f4") { midMenuLast.parameters.leakReversalPotential.maxValue = newValue; }
                                if(this.id == "g4") { midMenuLast.parameters.tauMembrane.maxValue = newValue; }
                                if(this.id == "h4") { midMenuLast.parameters.rMembrane.maxValue = newValue; }
                                if(this.id == "i4") { midMenuLast.parameters.spikeShape.maxValue = newValue; }
                            }
                            else if(midMenuLast.type === "HodgkinHuxley") {
                                if(this.id == "a4") { midMenuLast.parameters.threshold.maxValue = newValue; }
                                if(this.id == "b4") { midMenuLast.parameters.restingPotential.maxValue = newValue; }
                                if(this.id == "c4") { midMenuLast.parameters.capacitence.maxValue = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
                   }
    });
    for(var x=0; x<dynamicChanNum; x++) {
	    $('#chantype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
                                if(this.id == "cha1"+thisVal) { midMenuLast.parameters.channel[thisVal].vHalf.type = dropChoice[newValue].text; }
                                if(this.id == "chb1"+thisVal) { midMenuLast.parameters.channel[thisVal].r.type = dropChoice[newValue].text;}
                                if(this.id == "chc1"+thisVal) { midMenuLast.parameters.channel[thisVal].activationSlope.type = dropChoice[newValue].text; }
                                if(this.id == "chd1"+thisVal) { midMenuLast.parameters.channel[thisVal].deactivationSlope.type = dropChoice[newValue].text; }
                                if(this.id == "che1"+thisVal) { midMenuLast.parameters.channel[thisVal].equilibriumSlope.type = dropChoice[newValue].text; }
                                if(this.id == "chf1"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.type = dropChoice[newValue].text; }
                                if(this.id == "chg1"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.type = dropChoice[newValue].text; }
                                if(this.id == "chh1"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.type = dropChoice[newValue].text; }
                            }
                            if(midMenuLast.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
                                if(this.id == "cha1"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.type = dropChoice[newValue].text; }
                                if(this.id == "chb1"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.type = dropChoice[newValue].text; }
                                if(this.id == "chc1"+thisVal) { midMenuLast.parameters.channel[thisVal].backwardsRate.type = dropChoice[newValue].text; }
                                if(this.id == "chd1"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardScale.type = dropChoice[newValue].text; }
                                if(this.id == "che1"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardExponent.type = dropChoice[newValue].text; }
                                if(this.id == "chf1"+thisVal) { midMenuLast.parameters.channel[thisVal].tauScale.type = dropChoice[newValue].text; }
                            }
                            else if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Channel") {
                                if(this.id == "cha1"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.type = dropChoice[newValue].text; }
                                if(this.id == "chb1"+thisVal) { midMenuLast.parameters.channel[thisVal].reversePotential.type = dropChoice[newValue].text; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#chanvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
                                if(this.id == "cha2"+thisVal) { midMenuLast.parameters.channel[thisVal].vHalf.value = newValue; }
                                if(this.id == "chb2"+thisVal) { midMenuLast.parameters.channel[thisVal].r.value = newValue; }
                                if(this.id == "chc2"+thisVal) { midMenuLast.parameters.channel[thisVal].activationSlope.value = newValue; }
                                if(this.id == "chd2"+thisVal) { midMenuLast.parameters.channel[thisVal].deactivationSlope.value = newValue; }
                                if(this.id == "che2"+thisVal) { midMenuLast.parameters.channel[thisVal].equilibriumSlope.value = newValue; }
                                if(this.id == "chf2"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.value = newValue; }
                                if(this.id == "chg2"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.value = newValue; }
                                if(this.id == "chh2"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.value = newValue; }
                            }
                            if(midMenuLast.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
                                if(this.id == "cha2"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.value = newValue; }
                                if(this.id == "chb2"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.value = newValue; }
                                if(this.id == "chc2"+thisVal) { midMenuLast.parameters.channel[thisVal].backwardsRate.value = newValue; }
                                if(this.id == "chd2"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardScale.value = newValue; }
                                if(this.id == "che2"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardExponent.value = newValue; }
                                if(this.id == "chf2"+thisVal) { midMenuLast.parameters.channel[thisVal].tauScale.value = newValue; }
                            }
                            else if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Channel") {
                                if(this.id == "cha2"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.value = newValue; }
                                if(this.id == "chb2"+thisVal) { midMenuLast.parameters.channel[thisVal].reversePotential.value = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#chanminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
                                if(this.id == "cha3"+thisVal) { midMenuLast.parameters.channel[thisVal].vHalf.minValue = newValue; }
                                if(this.id == "chb3"+thisVal) { midMenuLast.parameters.channel[thisVal].r.minValue = newValue; }
                                if(this.id == "chc3"+thisVal) { midMenuLast.parameters.channel[thisVal].activationSlope.minValue = newValue; }
                                if(this.id == "chd3"+thisVal) { midMenuLast.parameters.channel[thisVal].deactivationSlope.minValue = newValue; }
                                if(this.id == "che3"+thisVal) { midMenuLast.parameters.channel[thisVal].equilibriumSlope.minValue = newValue; }
                                if(this.id == "chf3"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.minValue = newValue; }
                                if(this.id == "chg3"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.minValue = newValue; }
                                if(this.id == "chh3"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.minValue = newValue; }
                            }
                            if(midMenuLast.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
                                if(this.id == "cha3"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.minValue = newValue; }
                                if(this.id == "chb3"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.minValue = newValue; }
                                if(this.id == "chc3"+thisVal) { midMenuLast.parameters.channel[thisVal].backwardsRate.minValue = newValue; }
                                if(this.id == "chd3"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardScale.minValue = newValue; }
                                if(this.id == "che3"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardExponent.minValue = newValue; }
                                if(this.id == "chf3"+thisVal) { midMenuLast.parameters.channel[thisVal].tauScale.minValue = newValue; }
                            }
                            else if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Channel") {
                                if(this.id == "cha3"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.minValue = newValue; }
                                if(this.id == "chb3"+thisVal) { midMenuLast.parameters.channel[thisVal].reversePotential.minValue = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#chanmaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
                                if(this.id == "cha4"+thisVal) { midMenuLast.parameters.channel[thisVal].vHalf.maxValue = newValue; }
                                if(this.id == "chb4"+thisVal) { midMenuLast.parameters.channel[thisVal].r.maxValue = newValue; }
                                if(this.id == "chc4"+thisVal) { midMenuLast.parameters.channel[thisVal].activationSlope.maxValue = newValue; }
                                if(this.id == "chd4"+thisVal) { midMenuLast.parameters.channel[thisVal].deactivationSlope.maxValue = newValue; }
                                if(this.id == "che4"+thisVal) { midMenuLast.parameters.channel[thisVal].equilibriumSlope.maxValue = newValue; }
                                if(this.id == "chf4"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.maxValue = newValue; }
                                if(this.id == "chg4"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.maxValue = newValue; }
                                if(this.id == "chh4"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.maxValue = newValue; }
                            }
                            if(midMenuLast.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
                                if(this.id == "cha4"+thisVal) { midMenuLast.parameters.channel[thisVal].mInitial.maxValue = newValue; }
                                if(this.id == "chb4"+thisVal) { midMenuLast.parameters.channel[thisVal].reversalPotential.maxValue = newValue; }
                                if(this.id == "chc4"+thisVal) { midMenuLast.parameters.channel[thisVal].backwardsRate.maxValue = newValue; }
                                if(this.id == "chd4"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardScale.maxValue = newValue; }
                                if(this.id == "che4"+thisVal) { midMenuLast.parameters.channel[thisVal].forwardExponent.maxValue = newValue; }
                                if(this.id == "chf4"+thisVal) { midMenuLast.parameters.channel[thisVal].tauScale.maxValue = newValue; }
                            }
                            else if(midMenuLast.parameters.channel[thisVal].name === "Voltage Gated Channel") {
                                if(this.id == "cha4"+thisVal) { midMenuLast.parameters.channel[thisVal].conductance.maxValue = newValue; }
                                if(this.id == "chb4"+thisVal) { midMenuLast.parameters.channel[thisVal].reversePotential.maxValue = newValue; }
                            }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#particletype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "pa1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.power.type = dropChoice[newValue].text; }
                            if(this.id == "pb1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.xInitial.type = dropChoice[newValue].text; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#particlevalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "pa2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.power.value = newValue; }
                            if(this.id == "pb2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.xInitial.value = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#particleminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "pa3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.power.minValue = newValue; }
                            if(this.id == "pb3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.xInitial.maxValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#particlemaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "pa4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.power.maxValue = newValue; }
                            if(this.id == "pb4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.xInitial.maxValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constanttype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "ca1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.a.type = dropChoice[newValue].text; }
                            if(this.id == "cb1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.b.type = dropChoice[newValue].text; }
                            if(this.id == "cc1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.c.type = dropChoice[newValue].text; }
                            if(this.id == "cd1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.d.type = dropChoice[newValue].text; }
                            if(this.id == "cf1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.f.type = dropChoice[newValue].text; }
                            if(this.id == "ch1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.h.type = dropChoice[newValue].text; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "ca2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.a.value = newValue; }
                            if(this.id == "cb2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.b.value = newValue; }
                            if(this.id == "cc2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.c.value = newValue; }
                            if(this.id == "cd2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.d.value = newValue; }
                            if(this.id == "cf2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.f.value = newValue; }
                            if(this.id == "ch2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.h.value = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "ca3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.a.minValue = newValue; }
                            if(this.id == "cb3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.b.minValue = newValue; }
                            if(this.id == "cc3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.c.minValue = newValue; }
                            if(this.id == "cd3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.d.minValue = newValue; }
                            if(this.id == "cf3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.f.minValue = newValue; }
                            if(this.id == "ch3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.h.minValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantmaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "ca4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.a.maxValue = newValue; }
                            if(this.id == "cb4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.b.maxValue = newValue; }
                            if(this.id == "cc4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.c.maxValue = newValue; }
                            if(this.id == "cd4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.d.maxValue = newValue; }
                            if(this.id == "cf4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.f.maxValue = newValue; }
                            if(this.id == "ch4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.alpha.h.maxValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constanttype2'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "cba1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.a.type = dropChoice[newValue].text; }
                            if(this.id == "cbb1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.b.type = dropChoice[newValue].text; }
                            if(this.id == "cbc1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.c.type = dropChoice[newValue].text; }
                            if(this.id == "cbd1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.d.type = dropChoice[newValue].text; }
                            if(this.id == "cbf1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.f.type = dropChoice[newValue].text; }
                            if(this.id == "cbh1"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.h.type = dropChoice[newValue].text; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "cba2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.a.value = newValue; }
                            if(this.id == "cbb2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.b.value = newValue; }
                            if(this.id == "cbc2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.c.value = newValue; }
                            if(this.id == "cbd2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.d.value = newValue; }
                            if(this.id == "cbf2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.f.value = newValue; }
                            if(this.id == "cbh2"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.h.value = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantminvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "cba3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.a.minValue = newValue; }
                            if(this.id == "cbb3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.b.minValue = newValue; }
                            if(this.id == "cbc3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.c.minValue = newValue; }
                            if(this.id == "cbd3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.d.minValue = newValue; }
                            if(this.id == "cbf3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.f.minValue = newValue; }
                            if(this.id == "cbh3"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.h.minValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	    $('#constantmaxvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
                        var thisVal = this.id.slice(-1);
                        if(midMenuLast.className === "neuron") {
                            if(this.id == "cba4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.a.maxValue = newValue; }
                            if(this.id == "cbb4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.b.maxValue = newValue; }
                            if(this.id == "cbc4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.c.maxValue = newValue; }
                            if(this.id == "cbd4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.d.maxValue = newValue; }
                            if(this.id == "cbf4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.f.maxValue = newValue; }
                            if(this.id == "cbh4"+thisVal) { midMenuLast.parameters.channel[thisVal].particles.beta.h.maxValue = newValue; }
                        }
                        else if(midMenuLast.className === "cellGroup") {
                            
                        }
	            }
	    });
	}

}




function showParameterNames() {
    hideAll();
    $('#synCollapse').show();

    $('#collapse2').html('');
    dynamicChanNum = 0;

    $('#groupName').html(midMenuLast.name + ' Parameters');

    if(midMenuLast.className === "cellGroup") { 
        midMenuLast = midMenuLast.modelParameters;
    }

    $('#paramCollapse').show();
    // $('#cellGroupCollapse').show();

    $('#parameterValues').html('');
    $('#parameterValues').append('<div id="name"></div>');
    $('#parameterValues').append('<div id="type1"></div>');
    $('#parameterValues').append('<div class="row">');
    $('#parameterValues').append('<div id="type2" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="value" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="minvalue" class="col-lg-3"></div>');
    $('#parameterValues').append('<div id="maxvalue" class="col-lg-3"></div>');
    $('#parameterValues').append('</div>');
    $('#paramval').html('');

    if(midMenuLast.type === "Izhikevich") {
        $('#izParam').show();
        $('#parameterValues').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.parameters.a.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.parameters.a.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.parameters.a.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.parameters.a.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.parameters.b.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.parameters.b.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.parameters.b.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.parameters.b.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.parameters.c.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.parameters.c.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.parameters.c.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.parameters.c.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.parameters.d.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.parameters.d.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.parameters.d.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.parameters.d.maxValue +'</a>');

        $("#type2").append('<a id="u1" class="list-group-item" data-type="select">' + midMenuLast.parameters.u.type +'</a>');
        $("#value").append('<a id="u2" class="list-group-item">' + midMenuLast.parameters.u.value +'</a>');
        $("#minvalue").append('<a id="u3" class="list-group-item">' + midMenuLast.parameters.u.minValue +'</a>');
        $("#maxvalue").append('<a id="u4" class="list-group-item">' + midMenuLast.parameters.u.maxValue +'</a>');

        $("#type2").append('<a id="v1" class="list-group-item" data-type="select">' + midMenuLast.parameters.v.type +'</a>');
        $("#value").append('<a id="v2" class="list-group-item">' + midMenuLast.parameters.v.value +'</a>');
        $("#minvalue").append('<a id="v3" class="list-group-item">' + midMenuLast.parameters.v.minValue +'</a>');
        $("#maxvalue").append('<a id="v4" class="list-group-item">' + midMenuLast.parameters.v.maxValue +'</a>');

        $("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.parameters.threshold.type +'</a>');
        $("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.parameters.threshold.maxValue +'</a>');

    }
    else if(midMenuLast.type === "NCS") {
        $('#ncsParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.parameters.calcium.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.parameters.calcium.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.parameters.calcium.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.parameters.calcium.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.parameters.calciumSpikeIncrement.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.parameters.calciumSpikeIncrement.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.parameters.calciumSpikeIncrement.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.parameters.calciumSpikeIncrement.maxValue +'</a>');

        $("#type2").append('<a id="e1" class="list-group-item" data-type="select">' + midMenuLast.parameters.tauCalcium.type +'</a>');
        $("#value").append('<a id="e2" class="list-group-item">' + midMenuLast.parameters.tauCalcium.value +'</a>');
        $("#minvalue").append('<a id="e3" class="list-group-item">' + midMenuLast.parameters.tauCalcium.minValue +'</a>');
        $("#maxvalue").append('<a id="e4" class="list-group-item">' + midMenuLast.parameters.tauCalcium.maxValue +'</a>');

        $("#type2").append('<a id="f1" class="list-group-item" data-type="select">' + midMenuLast.parameters.leakReversalPotential.type +'</a>');
        $("#value").append('<a id="f2" class="list-group-item">' + midMenuLast.parameters.leakReversalPotential.value +'</a>');
        $("#minvalue").append('<a id="f3" class="list-group-item">' + midMenuLast.parameters.leakReversalPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="f4" class="list-group-item">' + midMenuLast.parameters.leakReversalPotential.maxValue +'</a>');

        $("#type2").append('<a id="g1" class="list-group-item" data-type="select">' + midMenuLast.parameters.tauMembrane.type +'</a>');
        $("#value").append('<a id="g2" class="list-group-item">' + midMenuLast.parameters.tauMembrane.value +'</a>');
        $("#minvalue").append('<a id="g3" class="list-group-item">' + midMenuLast.parameters.tauMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="g4" class="list-group-item">' + midMenuLast.parameters.tauMembrane.maxValue +'</a>');

        $("#type2").append('<a id="h1" class="list-group-item" data-type="select">' + midMenuLast.parameters.rMembrane.type +'</a>');
        $("#value").append('<a id="h2" class="list-group-item">' + midMenuLast.parameters.rMembrane.value +'</a>');
        $("#minvalue").append('<a id="h3" class="list-group-item">' + midMenuLast.parameters.rMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="h4" class="list-group-item">' + midMenuLast.parameters.rMembrane.maxValue +'</a>');

        $("#type2").append('<a id="i1" class="list-group-item" data-type="select">' + midMenuLast.parameters.spikeShape.type +'</a>');
        $("#value").append('<a id="i2" class="list-group-item">' + midMenuLast.parameters.spikeShape.value +'</a>');
        $("#minvalue").append('<a id="i3" class="list-group-item">' + midMenuLast.parameters.spikeShape.minValue +'</a>');
        $("#maxvalue").append('<a id="i4" class="list-group-item">' + midMenuLast.parameters.spikeShape.maxValue +'</a>');

        $('#collapse2').html('');
        for(var i=0; i<midMenuLast.parameters.channel.length; i++) {
            var num = dynamicChanNum;
            chanCollapseAdd();
            hideChanParam();
            $('#vgiChan'+num).hide();
            $('#vgChan'+num).hide();
            $('#cdChan'+num).hide();
            $('#particleCollapse'+num).hide();

            $('#chan'+num+'Name').empty();
            $('#chan'+num+'Name').append(midMenuLast.parameters.channel[i].name);

            showChannelParams(midMenuLast.parameters.channel[i], i);
        }
    }
    else if(midMenuLast.type === "HodgkinHuxley") {
        $('#hhParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        $('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.parameters.capacitence.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.parameters.capacitence.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.parameters.capacitence.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.parameters.capacitence.maxValue +'</a>');

        $('#collapse2').html('');
        for(var i=0; i<midMenuLast.parameters.channel.length; i++) {
            var num = dynamicChanNum;
            chanCollapseAdd();
            hideChanParam();
            $('#vgiChan'+num).hide();
            $('#vgChan'+num).hide();
            $('#cdChan'+num).hide();
            $('#particleCollapse'+num).hide();

            $('#chan'+num+'Name').empty();
            $('#chan'+num+'Name').append(midMenuLast.parameters.channel[i].name);

            showChannelParams(midMenuLast.parameters.channel[i], i);
        }
    }

}

function showChannelParams(source, val) {
    $('#channelValues'+val).html('');
    $('#channelValues'+val).show();
    $('#channelValues'+val).append('<div class="row">');
    $('#channelValues'+val).append('<div id="chantype'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#channelValues'+val).append('<div id="chanvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#channelValues'+val).append('<div id="chanminvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#channelValues'+val).append('<div id="chanmaxvalue'+val+'" class="col-lg-3" style="display:block; padding-left: 0px"></div>');
    $('#channelValues'+val).append('</div>');

    if(source.name === "Voltage Gated Ion Channel") {
        $('#vgiChan'+val).show();
        $("#chantype"+val).append('<a id="cha1'+val+'" class="list-group-item"  data-type="select">' + source.vHalf.type +'</a>');
        $("#chanvalue"+val).append('<a id="cha2'+val+'" class="list-group-item"  data-type="number">' + source.vHalf.value +'</a>');
        $("#chanminvalue"+val).append('<a id="cha3'+val+'" class="list-group-item"  data-type="number">' + source.vHalf.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="cha4'+val+'" class="list-group-item"  data-type="number">' + source.vHalf.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chb1'+val+'" class="list-group-item"  data-type="select">' + source.r.type +'</a>');
        $("#chanvalue"+val).append('<a id="chb2'+val+'" class="list-group-item"  data-type="number">' + source.r.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chb3'+val+'" class="list-group-item"  data-type="number">' + source.r.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chb4'+val+'" class="list-group-item"  data-type="number">' + source.r.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chc1'+val+'" class="list-group-item"  data-type="select">' + source.activationSlope.type +'</a>');
        $("#chanvalue"+val).append('<a id="chc2'+val+'" class="list-group-item"  data-type="number">' + source.activationSlope.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chc3'+val+'" class="list-group-item"  data-type="number">' + source.activationSlope.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chc4'+val+'" class="list-group-item"  data-type="number">' + source.activationSlope.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chd1'+val+'" class="list-group-item"  data-type="select">' + source.deactivationSlope.type +'</a>');
        $("#chanvalue"+val).append('<a id="chd2'+val+'" class="list-group-item"  data-type="number">' + source.deactivationSlope.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chd3'+val+'" class="list-group-item"  data-type="number">' + source.deactivationSlope.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chd4'+val+'" class="list-group-item"  data-type="number">' + source.deactivationSlope.maxValue +'</a>');

        $("#chantype"+val).append('<a id="che1'+val+'" class="list-group-item"  data-type="select">' + source.equilibriumSlope.type +'</a>');
        $("#chanvalue"+val).append('<a id="che2'+val+'" class="list-group-item"  data-type="number">' + source.equilibriumSlope.value +'</a>');
        $("#chanminvalue"+val).append('<a id="che3'+val+'" class="list-group-item"  data-type="number">' + source.equilibriumSlope.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="che4'+val+'" class="list-group-item"  data-type="number">' + source.equilibriumSlope.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chf1'+val+'" class="list-group-item"  data-type="select">' + source.conductance.type +'</a>');
        $("#chanvalue"+val).append('<a id="chf2'+val+'" class="list-group-item"  data-type="number">' + source.conductance.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chf3'+val+'" class="list-group-item"  data-type="number">' + source.conductance.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chf4'+val+'" class="list-group-item"  data-type="number">' + source.conductance.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chg1'+val+'" class="list-group-item"  data-type="select">' + source.reversalPotential.type +'</a>');
        $("#chanvalue"+val).append('<a id="chg2'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chg3'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chg4'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chh1'+val+'" class="list-group-item"  data-type="select">' + source.mInitial.type +'</a>');
        $("#chanvalue"+val).append('<a id="chh2'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chh3'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chh4'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.maxValue +'</a>');
    }
    else if(source.name === "Calcium Dependant Channel") {
        $('#cdChan'+val).show();
        $("#chantype"+val).append('<a id="cha1'+val+'" class="list-group-item"  data-type="select">' + source.mInitial.type +'</a>');
        $("#chanvalue"+val).append('<a id="cha2'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.value +'</a>');
        $("#chanminvalue"+val).append('<a id="cha3'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="cha4'+val+'" class="list-group-item"  data-type="number">' + source.mInitial.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chb1'+val+'" class="list-group-item"  data-type="select">' + source.reversalPotential.type +'</a>');
        $("#chanvalue"+val).append('<a id="chb2'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chb3'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chb4'+val+'" class="list-group-item"  data-type="number">' + source.reversalPotential.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chc1'+val+'" class="list-group-item"  data-type="select">' + source.backwardsRate.type +'</a>');
        $("#chanvalue"+val).append('<a id="chc2'+val+'" class="list-group-item"  data-type="number">' + source.backwardsRate.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chc3'+val+'" class="list-group-item"  data-type="number">' + source.backwardsRate.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chc4'+val+'" class="list-group-item"  data-type="number">' + source.backwardsRate.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chd1'+val+'" class="list-group-item"  data-type="select">' + source.forwardScale.type +'</a>');
        $("#chanvalue"+val).append('<a id="chd2'+val+'" class="list-group-item"  data-type="number">' + source.forwardScale.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chd3'+val+'" class="list-group-item"  data-type="number">' + source.forwardScale.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chd4'+val+'" class="list-group-item"  data-type="number">' + source.forwardScale.maxValue +'</a>');

        $("#chantype"+val).append('<a id="che1'+val+'" class="list-group-item"  data-type="select">' + source.forwardExponent.type +'</a>');
        $("#chanvalue"+val).append('<a id="che2'+val+'" class="list-group-item"  data-type="number">' + source.forwardExponent.value +'</a>');
        $("#chanminvalue"+val).append('<a id="che3'+val+'" class="list-group-item"  data-type="number">' + source.forwardExponent.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="che4'+val+'" class="list-group-item"  data-type="number">' + source.forwardExponent.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chf1'+val+'" class="list-group-item"  data-type="select">' + source.tauScale.type +'</a>');
        $("#chanvalue"+val).append('<a id="chf2'+val+'" class="list-group-item"  data-type="number">' + source.tauScale.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chf3'+val+'" class="list-group-item"  data-type="number">' + source.tauScale.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chf4'+val+'" class="list-group-item"  data-type="number">' + source.tauScale.maxValue +'</a>');
    }
    else if(source.name === "Voltage Gated Channel") {
        $('#particleCollapse'+val).show();
        $('#vgChan'+val).show();
        $("#chantype"+val).append('<a id="cha1'+val+'" class="list-group-item"  data-type="select">' + source.conductance.type +'</a>');
        $("#chanvalue"+val).append('<a id="cha2'+val+'" class="list-group-item"  data-type="number">' + source.conductance.value +'</a>');
        $("#chanminvalue"+val).append('<a id="cha3'+val+'" class="list-group-item"  data-type="number">' + source.conductance.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="cha4'+val+'" class="list-group-item"  data-type="number">' + source.conductance.maxValue +'</a>');

        $("#chantype"+val).append('<a id="chb1'+val+'" class="list-group-item"  data-type="select">' + source.reversePotential.type +'</a>');
        $("#chanvalue"+val).append('<a id="chb2'+val+'" class="list-group-item"  data-type="number">' + source.reversePotential.value +'</a>');
        $("#chanminvalue"+val).append('<a id="chb3'+val+'" class="list-group-item"  data-type="number">' + source.reversePotential.minValue +'</a>');
        $("#chanmaxvalue"+val).append('<a id="chb4'+val+'" class="list-group-item"  data-type="number">' + source.reversePotential.maxValue +'</a>');
        $('#particlesValues'+val).show();
        $('#particleCollapse'+val).show();
        showParticleParams(source, val);
    }

}

function showParticleParams(source, val) {
    $('#particleValues'+val).html('');
    $('#particleValues'+val).show();
    $('#particleValues'+val).append('<div class="row">');
    $('#particleValues'+val).append('<div id="particletype'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="particlevalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="particleminvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="particlemaxvalue'+val+'" class="col-lg-3" style="display:block; padding-left: 0px"></div>');
    $('#particleValues'+val).append('</div>');

    $("#particletype"+val).append('<a id="pa1'+val+'" class="list-group-item" data-type="select">' + source.particles.power.type +'</a>');
    $("#particlevalue"+val).append('<a id="pa2'+val+'" class="list-group-item" data-type="number">' + source.particles.power.value +'</a>');
    $("#particleminvalue"+val).append('<a id="pa3'+val+'" class="list-group-item" data-type="number">' + source.particles.power.minValue +'</a>');
    $("#particlemaxvalue"+val).append('<a id="pa4'+val+'" class="list-group-item" data-type="number">' + source.particles.power.maxValue +'</a>');

    $("#particletype"+val).append('<a id="pb1'+val+'" class="list-group-item" data-type="select">' + source.particles.xInitial.type +'</a>');
    $("#particlevalue"+val).append('<a id="pb2'+val+'" class="list-group-item" data-type="number">' + source.particles.xInitial.value +'</a>');
    $("#particleminvalue"+val).append('<a id="pb3'+val+'" class="list-group-item" data-type="number">' + source.particles.xInitial.minValue +'</a>');
    $("#particlemaxvalue"+val).append('<a id="pb4'+val+'" class="list-group-item" data-type="number">' + source.particles.xInitial.maxValue +'</a>');

    showParticleConstants(source,val);
}

function showParticleConstants(source, val) {
    $('#particleValues'+val).append('<div class="row">');
    $('#particleValues'+val).append('<div id="constanttype'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantminvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantmaxvalue'+val+'" class="col-lg-3" style="display:block; padding-left: 0px"></div>');
    $('#particleValues'+val).append('</div>');

    $("#constanttype"+val).append('<a id="ca1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.a.type +'</a>');
    $("#constantvalue"+val).append('<a id="ca2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.a.value +'</a>');
    $("#constantminvalue"+val).append('<a id="ca3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.a.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="ca4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.a.maxValue +'</a>');

    $("#constanttype"+val).append('<a id="cb1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.b.type +'</a>');
    $("#constantvalue"+val).append('<a id="cb2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.b.value +'</a>');
    $("#constantminvalue"+val).append('<a id="cb3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.b.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="cb4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.b.maxValue +'</a>');

    $("#constanttype"+val).append('<a id="cc1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.c.type +'</a>');
    $("#constantvalue"+val).append('<a id="cc2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.c.value +'</a>');
    $("#constantminvalue"+val).append('<a id="cc3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.c.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="cc4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.c.maxValue +'</a>');

    $("#constanttype"+val).append('<a id="cd1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.d.type +'</a>');
    $("#constantvalue"+val).append('<a id="cd2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.d.value +'</a>');
    $("#constantminvalue"+val).append('<a id="cd3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.d.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="cd4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.d.maxValue +'</a>');

    $("#constanttype"+val).append('<a id="cf1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.f.type +'</a>');
    $("#constantvalue"+val).append('<a id="cf2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.f.value +'</a>');
    $("#constantminvalue"+val).append('<a id="cf3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.f.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="cf4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.f.maxValue +'</a>');

    $("#constanttype"+val).append('<a id="ch1'+val+'" class="list-group-item" data-type="select">' + source.particles.alpha.h.type +'</a>');
    $("#constantvalue"+val).append('<a id="ch2'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.h.value +'</a>');
    $("#constantminvalue"+val).append('<a id="ch3'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.h.minValue +'</a>');
    $("#constantmaxvalue"+val).append('<a id="ch4'+val+'" class="list-group-item" data-type="number">' + source.particles.alpha.h.maxValue +'</a>');

    $('#particleValues'+val).append('<div class="row">');
    $('#particleValues'+val).append('<div id="constanttype2'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantvalue2'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantminvalue2'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#particleValues'+val).append('<div id="constantmaxvalue2'+val+'" class="col-lg-3" style="display:block; padding-left: 0px"></div>');
    $('#particleValues'+val).append('</div>');

    $("#constanttype2"+val).append('<a id="cba1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.a.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cba2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.a.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cba3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.a.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cba4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.a.maxValue +'</a>');

    $("#constanttype2"+val).append('<a id="cbb1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.b.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cbb2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.b.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cbb3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.b.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cbb4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.b.maxValue +'</a>');

    $("#constanttype2"+val).append('<a id="cbc1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.c.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cbc2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.c.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cbc3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.c.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cbc4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.c.maxValue +'</a>');

    $("#constanttype2"+val).append('<a id="cbd1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.d.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cbd2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.d.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cbd3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.d.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cbd4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.d.maxValue +'</a>');

    $("#constanttype2"+val).append('<a id="cbf1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.f.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cbf2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.f.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cbf3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.f.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cbf4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.f.maxValue +'</a>');

    $("#constanttype2"+val).append('<a id="cbh1'+val+'" class="list-group-item" data-type="select">' + source.particles.beta.h.type +'</a>');
    $("#constantvalue2"+val).append('<a id="cbh2'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.h.value +'</a>');
    $("#constantminvalue2"+val).append('<a id="cbh3'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.h.minValue +'</a>');
    $("#constantmaxvalue2"+val).append('<a id="cbh4'+val+'" class="list-group-item" data-type="number">' + source.particles.beta.h.maxValue +'</a>');
}

function popSynVal(val) {
	$('#synValues'+val).append('<div id=synpre'+val+' class="col-lg-12" style="display:block; padding-left: 0px"></div>');
	$('#synValues'+val).append('<div id=synpost'+val+' class="col-lg-12" style="display:block; padding-left: 0px"></div>');
	$('#synValues'+val).append('<div id=synprob'+val+' class="col-lg-12" style="display:block; padding-left: 0px"></div>');
	$('#synpre'+val).append('<a id="spre'+val+'" class="list-group-item">' + currentModel.synapses[val].pre +'</a>');
	$('#synpost'+val).append('<a id="spost'+val+'" class="list-group-item">' + currentModel.synapses[val].post +'</a>');
	$('#synprob'+val).append('<a id="sname'+val+'" class="list-group-item">' + currentModel.synapses[val].prob +'</a>');
    $('#synValues'+val).append('<div class="row">');
    $('#synValues'+val).append('<div id="syntype'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#synValues'+val).append('<div id="synvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#synValues'+val).append('<div id="synminvalue'+val+'" class="col-lg-3" style="display:block; padding: 0px"></div>');
    $('#synValues'+val).append('<div id="synmaxvalue'+val+'" class="col-lg-3" style="display:block; padding-left: 0px"></div>');
    $('#synValues'+val).append('</div>');

    if(currentModel.synapses[val].parameters.name === 'flatSynapse') {
	    $("#syntype"+val).append('<a id="s11'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.delay.type +'</a>');
	    $("#synvalue"+val).append('<a id="s12'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s13'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s14'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.current.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.current.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.current.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.current.maxValue +'</a>');
	}
	if(currentModel.synapses[val].parameters.name === 'ncsSynapse') {
	    $("#syntype"+val).append('<a id="s11'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.utilization.type +'</a>');
	    $("#synvalue"+val).append('<a id="s12'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.utilization.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s13'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.utilization.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s14'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.utilization.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.redistribution.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.redistribution.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.redistribution.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.redistribution.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s31'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.lastPrefireTime.type +'</a>');
	    $("#synvalue"+val).append('<a id="s32'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPrefireTime.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s33'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPrefireTime.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s34'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPrefireTime.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s41'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.lastPostfireTime.type +'</a>');
	    $("#synvalue"+val).append('<a id="s42'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPostfireTime.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s43'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPostfireTime.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s44'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.lastPostfireTime.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s51'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.tauFacilitation.type +'</a>');
	    $("#synvalue"+val).append('<a id="s52'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauFacilitation.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s53'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauFacilitation.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s54'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauFacilitation.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s61'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.tauDepression.type +'</a>');
	    $("#synvalue"+val).append('<a id="s62'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauDepression.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s63'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauDepression.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s64'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauDepression.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s71'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.tauLtp.type +'</a>');
	    $("#synvalue"+val).append('<a id="s72'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtp.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s73'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtp.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s74'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtp.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s81'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.tauLtd.type +'</a>');
	    $("#synvalue"+val).append('<a id="s82'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtd.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s83'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtd.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s84'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauLtd.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s91'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.aLtpMinimum.type +'</a>');
	    $("#synvalue"+val).append('<a id="s92'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.aLtpMinimum.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s93'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.aLtpMinimum.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s94'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.aLtpMinimum.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s101'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.maxConductance.type +'</a>');
	    $("#synvalue"+val).append('<a id="s102'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.maxConductance.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s103'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.maxConductance.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s104'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.maxConductance.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s111'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.reversalPotential.type +'</a>');
	    $("#synvalue"+val).append('<a id="s112'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.reversalPotential.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s113'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.reversalPotential.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s114'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.reversalPotential.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s121'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.tauPostSynapticConductance.type +'</a>');
	    $("#synvalue"+val).append('<a id="s122'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauPostSynapticConductance.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s123'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauPostSynapticConductance.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s124'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.tauPostSynapticConductance.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s131'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.psgWaveformDuration.type +'</a>');
	    $("#synvalue"+val).append('<a id="s132'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.psgWaveformDuration.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s133'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.psgWaveformDuration.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s134'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.psgWaveformDuration.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s141'+val+'" class="list-group-item" data-type="select">' + currentModel.synapses[val].parameters.delay.type +'</a>');
	    $("#synvalue"+val).append('<a id="s142'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s143'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s144'+val+'" class="list-group-item" data-type="number">' + currentModel.synapses[val].parameters.delay.maxValue +'</a>');
	}
}

function makeSynEditable(val) {
	var dropChoice = [{ 'value': 0, 'text': 'exact' }, { 'value': 1, 'text': 'uniform' }, { 'value': 2, 'text': 'normal' }];
	for(var x=0; x<val; x++) {
		$('#syntype'+x+' a').editable({
		        'source': dropChoice,
		        'success': function(response, newValue) {
                                if(lastSelectSynapse.parameters.name === 'flatSynapse') {
                                    if(this.id == "s11"+x) {lastSelectSynapse.parameters.delay.type = dropChoice[newValue].text;}
                                    if(this.id == "s21"+x) {lastSelectSynapse.parameters.current.type = dropChoice[newValue].text;}
                                }
                                else if(lastSelectSynapse.parameters.name === 'ncsSynapse') {
                                    if(this.id == "s11"+x) {lastSelectSynapse.parameters.utilization.type = dropChoice[newValue].text;}
                                    if(this.id == "s21"+x) {lastSelectSynapse.parameters.redistribution.type = dropChoice[newValue].text;}
                                    if(this.id == "s31"+x) {lastSelectSynapse.parameters.lastPrefireTime.type = dropChoice[newValue].text;}
                                    if(this.id == "s41"+x) {lastSelectSynapse.parameters.lastPostfireTime.type = dropChoice[newValue].text;}
                                    if(this.id == "s51"+x) {lastSelectSynapse.parameters.tauFacilitation.type = dropChoice[newValue].text;}
                                    if(this.id == "s61"+x) {lastSelectSynapse.parameters.tauDepression.type = dropChoice[newValue].text;}
                                    if(this.id == "s71"+x) {lastSelectSynapse.parameters.tauLtp.type = dropChoice[newValue].text;}
                                    if(this.id == "s81"+x) {lastSelectSynapse.parameters.tauLtd.type = dropChoice[newValue].text;}
                                    if(this.id == "s91"+x) {lastSelectSynapse.parameters.aLtpMinimum.type = dropChoice[newValue].text;}
                                    if(this.id == "s101"+x) {lastSelectSynapse.parameters.maxConductance.type = dropChoice[newValue].text;}
                                    if(this.id == "s111"+x) {lastSelectSynapse.parameters.reversalPotential.type = dropChoice[newValue].text;}
                                    if(this.id == "s121"+x) {lastSelectSynapse.parameters.tauPostSynapticConductance.type = dropChoice[newValue].text;}
                                    if(this.id == "s131"+x) {lastSelectSynapse.parameters.psgWaveformDuration.type = dropChoice[newValue].text;}
                                    if(this.id == "s141"+x) {lastSelectSynapse.parameters.delay.type = dropChoice[newValue].text;}
                                }
		                    }
		    });
            $('#synvalue'+x+' a').editable({
                'source': dropChoice,
                'success': function(response, newValue) {
                                if(lastSelectSynapse.parameters.name === 'flatSynapse') {
                                    if(this.id == "s12"+x) {lastSelectSynapse.parameters.delay.value = newValue;}
                                    if(this.id == "s22"+x) {lastSelectSynapse.parameters.current.value = newValue;}
                                }
                                else if(lastSelectSynapse.parameters.name === 'ncsSynapse') {
                                    if(this.id == "s12"+x) {lastSelectSynapse.parameters.utilization.value = newValue;}
                                    if(this.id == "s22"+x) {lastSelectSynapse.parameters.redistribution.value = newValue;}
                                    if(this.id == "s32"+x) {lastSelectSynapse.parameters.lastPrefireTime.value = newValue;}
                                    if(this.id == "s42"+x) {lastSelectSynapse.parameters.lastPostfireTime.value = newValue;}
                                    if(this.id == "s52"+x) {lastSelectSynapse.parameters.tauFacilitation.value = newValue;}
                                    if(this.id == "s62"+x) {lastSelectSynapse.parameters.tauDepression.value = newValue;}
                                    if(this.id == "s72"+x) {lastSelectSynapse.parameters.tauLtp.value = newValue;}
                                    if(this.id == "s82"+x) {lastSelectSynapse.parameters.tauLtd.value = newValue;}
                                    if(this.id == "s92"+x) {lastSelectSynapse.parameters.aLtpMinimum.value = newValue;}
                                    if(this.id == "s102"+x) {lastSelectSynapse.parameters.maxConductance.value = newValue;}
                                    if(this.id == "s112"+x) {lastSelectSynapse.parameters.reversalPotential.value = newValue;}
                                    if(this.id == "s122"+x) {lastSelectSynapse.parameters.tauPostSynapticConductance.value = newValue;}
                                    if(this.id == "s132"+x) {lastSelectSynapse.parameters.psgWaveformDuration.value = newValue;}
                                    if(this.id == "s142"+x) {lastSelectSynapse.parameters.delay.value = newValue;}
                                }
                            }
            });
            $('#synminvalue'+x+' a').editable({
                'source': dropChoice,
                'success': function(response, newValue) {
                                if(lastSelectSynapse.parameters.name === 'flatSynapse') {
                                    if(this.id == "s13"+x) {lastSelectSynapse.parameters.delay.minValue = newValue;}
                                    if(this.id == "s23"+x) {lastSelectSynapse.parameters.current.minValue = newValue;}
                                }
                                else if(lastSelectSynapse.parameters.name === 'ncsSynapse') {
                                    if(this.id == "s13"+x) {lastSelectSynapse.parameters.utilization.minValue = newValue;}
                                    if(this.id == "s23"+x) {lastSelectSynapse.parameters.redistribution.minValue = newValue;}
                                    if(this.id == "s33"+x) {lastSelectSynapse.parameters.lastPrefireTime.minValue = newValue;}
                                    if(this.id == "s43"+x) {lastSelectSynapse.parameters.lastPostfireTime.minValue = newValue;}
                                    if(this.id == "s53"+x) {lastSelectSynapse.parameters.tauFacilitation.minValue = newValue;}
                                    if(this.id == "s63"+x) {lastSelectSynapse.parameters.tauDepression.minValue = newValue;}
                                    if(this.id == "s73"+x) {lastSelectSynapse.parameters.tauLtp.minValue = newValue;}
                                    if(this.id == "s83"+x) {lastSelectSynapse.parameters.tauLtd.minValue = newValue;}
                                    if(this.id == "s93"+x) {lastSelectSynapse.parameters.aLtpMinimum.minValue = newValue;}
                                    if(this.id == "s103"+x) {lastSelectSynapse.parameters.maxConductance.minValue = newValue;}
                                    if(this.id == "s113"+x) {lastSelectSynapse.parameters.reversalPotential.minValue = newValue;}
                                    if(this.id == "s123"+x) {lastSelectSynapse.parameters.tauPostSynapticConductance.minValue = newValue;}
                                    if(this.id == "s133"+x) {lastSelectSynapse.parameters.psgWaveformDuration.minValue = newValue;}
                                    if(this.id == "s143"+x) {lastSelectSynapse.parameters.delay.minValue = newValue;}
                                }
                            }
            });
            $('#synmaxvalue'+x+' a').editable({
                'source': dropChoice,
                'success': function(response, newValue) {
                                if(lastSelectSynapse.parameters.name === 'flatSynapse') {
                                    if(this.id == "s14"+x) {lastSelectSynapse.parameters.delay.maxValue = newValue;}
                                    if(this.id == "s24"+x) {lastSelectSynapse.parameters.current.maxValue = newValue;}
                                }
                                else if(lastSelectSynapse.parameters.name === 'ncsSynapse') {
                                    if(this.id == "s14"+x) {lastSelectSynapse.parameters.utilization.maxValue = newValue;}
                                    if(this.id == "s24"+x) {lastSelectSynapse.parameters.redistribution.maxValue = newValue;}
                                    if(this.id == "s34"+x) {lastSelectSynapse.parameters.lastPrefireTime.maxValue = newValue;}
                                    if(this.id == "s44"+x) {lastSelectSynapse.parameters.lastPostfireTime.maxValue = newValue;}
                                    if(this.id == "s54"+x) {lastSelectSynapse.parameters.tauFacilitation.maxValue = newValue;}
                                    if(this.id == "s64"+x) {lastSelectSynapse.parameters.tauDepression.maxValue = newValue;}
                                    if(this.id == "s74"+x) {lastSelectSynapse.parameters.tauLtp.maxValue = newValue;}
                                    if(this.id == "s84"+x) {lastSelectSynapse.parameters.tauLtd.maxValue = newValue;}
                                    if(this.id == "s94"+x) {lastSelectSynapse.parameters.aLtpMinimum.maxValue = newValue;}
                                    if(this.id == "s104"+x) {lastSelectSynapse.parameters.maxConductance.maxValue = newValue;}
                                    if(this.id == "s114"+x) {lastSelectSynapse.parameters.reversalPotential.maxValue = newValue;}
                                    if(this.id == "s124"+x) {lastSelectSynapse.parameters.tauPostSynapticConductance.maxValue = newValue;}
                                    if(this.id == "s134"+x) {lastSelectSynapse.parameters.psgWaveformDuration.maxValue = newValue;}
                                    if(this.id == "s144"+x) {lastSelectSynapse.parameters.delay.maxValue = newValue;}
                                }
                            }
            });
	}
}

function chanCollapseAdd() {
	var collapseable = '<div class="panel panel-default" style="overflow:visible;">\
                                    <div class="panel-heading">\
                                        <h4 class="panel-title">\
                                            <a id="chan'+dynamicChanNum+'Name" data-toggle="collapse" data-parent="#chanCollapse" href="#chan_'+dynamicChanNum+'">\
                                                \
                                            </a>\
                                        </h4>\
                                    </div>\
                                    <div id="chan_'+dynamicChanNum+'" class="panel-collapse collapse in">\
                                        <div class="row">\
                                            <div id="channels" class="col-lg-5" style="display:block; padding-right: 0px; width:210px">\
                                                <div id="vgiChan'+dynamicChanNum+'">\
                                                    <a class="list-group-item"> vHalf: </a>\
                                                    <a class="list-group-item"> r: </a>\
                                                    <a class="list-group-item"> Activation Slope: </a>\
                                                    <a class="list-group-item"> De-Activation Slope: </a>\
                                                    <a class="list-group-item"> Equilibrium Slope: </a>\
                                                    <a class="list-group-item"> Conductance: </a>\
                                                    <a class="list-group-item"> Reversal Potential: </a>\
                                                    <a class="list-group-item"> mInitial: </a>\
                                                </div>\
                                                <div id="cdChan'+dynamicChanNum+'">\
                                                    <a class="list-group-item"> mInitial: </a>\
                                                    <a class="list-group-item"> Reversal Potential: </a>\
                                                    <a class="list-group-item"> Backwards Rate: </a>\
                                                    <a class="list-group-item"> Forward Scale: </a>\
                                                    <a class="list-group-item"> Forward Exponent: </a>\
                                                    <a class="list-group-item"> Tau Scale: </a>\
                                                </div>\
                                                <div id="vgChan'+dynamicChanNum+'">\
                                                    <a class="list-group-item"> Conductance: </a>\
                                                    <a class="list-group-item"> Reverse Potential: </a>\
                                                </div>\
                                            </div>\
                                            <div id="channelValues'+dynamicChanNum+'" class="col-lg-7" style="display:block; padding: 0px">\
\
                                            </div>\
                                        </div>\
                                        <div class="panel panel-default" id="particleCollapse'+dynamicChanNum+'" style="overflow:visible;">\
                                            <div class="panel-heading">\
                                                <h4 class="panel-title">\
                                                    <a data-toggle="collapse" data-parent="#vgChan" href="#collapse3">\
                                                        Particles \
                                                    </a>\
                                                </h4>\
                                            </div>\
                                            <div id="collapse3" class="panel-collapse collapse in">\
                                                <div class="row">\
                                                    <div id="particles'+dynamicChanNum+'" class="col-lg-5" style="display:block; padding-right: 0px; width: 210px">\
                                                        <a class="list-group-item"> Power: </a>\
                                                        <a class="list-group-item"> xInitial: </a>\
                                                        <div id="alphaP'+dynamicChanNum+'">\
                                                            <a class="list-group-item"> A: </a>\
                                                            <a class="list-group-item"> B: </a>\
                                                            <a class="list-group-item"> C: </a>\
                                                            <a class="list-group-item"> D: </a>\
                                                            <a class="list-group-item"> F: </a>\
                                                            <a class="list-group-item"> H: </a>\
                                                        </div>\
                                                        <div id="betaP'+dynamicChanNum+'">\
                                                            <a class="list-group-item"> A: </a>\
                                                            <a class="list-group-item"> B: </a>\
                                                            <a class="list-group-item"> C: </a>\
                                                            <a class="list-group-item"> D: </a>\
                                                            <a class="list-group-item"> F: </a>\
                                                            <a class="list-group-item"> H: </a>\
                                                        </div>\
                                                    </div>\
                                                    <div id="particleValues'+dynamicChanNum+'" class="col-lg-7" style="display:block; padding: 0px">\
\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

	$('#collapse2').append(collapseable);
	dynamicChanNum++;                               

}

function hideAll() {
	$('#synCollapse').hide();
    $('#cellGroupCollapse').hide();
    $('#izParam').hide();
    $('#ncsParam').hide();
    $('#hhParam').hide();
    $('#parameterValues').hide();
    $('#chanCollapse').hide();
    $('#vgiChan').hide();
    $('#cdChan').hide();
    $('#vgChan').hide();
    $('#channelValues').hide();
    $('#paramCollapse').hide();
    $('#particlesValues').hide();
    $('#particleCollapse').hide();
}

function hideChanParam() {
	$('#vgiChan').hide();
    $('#cdChan').hide();
    $('#vgChan').hide();
    $('#particlesValues').hide();
    $('#particleCollapse').hide();
}

function cloneModel(source) {
    var ret = new modelParameters();
    clone(ret, source);
    ret.parameters = cloneParam(source.parameters);
    return ret;
}

function cloneParam(source) {
    if(source.className === "izhikevichParam") {
        var ret = new izhikevichParam();
        clone(ret, source);
        return ret;
    }
    else if(source.className === "ncsParam") {
        var ret = new ncsParam();
        clone(ret, source);
        for(var i=0; i<source.channel.length; i++) {
            ret.channel[i] = cloneChan(source.channel[i]);
        }
        return ret;
    }
    else if(source.className === "hodgkinHuxleyParam") {
        var ret = new hodgkinHuxleyParam();
        clone(ret, source);
        for(var i=0; i<source.channel.length; i++) {
            ret.channel[i] = cloneChan(source.channel[i]);
        }
        return ret;
    }
}

function cloneChan(source) {
        if(source.className === "voltageGatedIonChannel") {
            var ret = new voltageGatedIonChannel();
            clone(ret, source);
        }
        else if(source.className === "calciumDependantChannel") {
            var ret = new calciumDependantChannel();
            clone(ret, source);
        }
        else if(source.className === "voltageGatedChannel") {
            var ret = new voltageGatedChannel();
            clone(ret, source);
            ret.particles = cloneParticles(source.particles);
        }
    return ret;
}

function cloneParticles(source) {
    var retA = new particleVariableConstants();
    clone(retA, source.alpha);
    var retB = new particleVariableConstants();
    clone(retB, source.beta);
    var ret = new voltageGatedParticle(retA, retB);
    clone(ret.power, source.power);
    clone(ret.xInitial, source.xInitial);
    return ret;
}

function clone2(source) {
    var clone = {};
    for( var key in source) {
        if(source.hasOwnProperty(key)) {
            clone[key] = source[key];
        }
    }
    return clone;   
}

function clone(destination, source) {
    for (var property in source) {
        if (typeof source[property] === "object" && source[property] !== null && destination[property]) { 
            clone(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
};

function getIndex(source, attr, value) {
    for(var i=0; i<source.length; i++) {
        if(source[i][attr] === value) {
            return i;
        }
    }
}


function createSynapse() {
	if(synapseChoice == 1) {
		var params = new flatSynapse();
		currentModel.synapses.push({name: $('#synapName').val(), pre: prePost[0], post: prePost[1], prob: $('#probOfConnection').val(), parameters: params});
        lastSelectSynapse = currentModel.synapses[currentModel.synapses.length - 1];
        console.log(lastSelectSynapse.name);
		var subCollapse = '<div id="flatsyn'+dynamicSynNum+'">\
		                    <a class="list-group-item"> PreSynaptic: </a>\
		                    <a class="list-group-item"> PostSynaptic: </a>\
		                    <a class="list-group-item"> Probability: </a>\
		                    <a class="list-group-item"> Delay: </a>\
		                    <a class="list-group-item"> Current: </a>\
		                   </div>';
	}
	else if(synapseChoice == 2) {
		currentModel.synapses.push(new synapseGroup($('#synapName').val(), prePost[0], prePost[1], $('#probOfConnection').val(), new ncsSynapse()));
        lastSelectSynapse = currentModel.synapses[currentModel.synapses.length - 1];
		var subCollapse = '<div id="ncssyn'+dynamicSynNum+'">\
		                    <a class="list-group-item"> PreSynaptic: </a>\
		                    <a class="list-group-item"> PostSynaptic: </a>\
                            <a class="list-group-item"> Utilization: </a>\
                            <a class="list-group-item"> Redistribution: </a>\
                            <a class="list-group-item"> Last Prefire Time: </a>\
                            <a class="list-group-item"> Last Postfire Time: </a>\
                            <a class="list-group-item"> Tau Facilitation: </a>\
                            <a class="list-group-item"> Tau Depression: </a>\
                            <a class="list-group-item"> Tau Ltp: </a>\
                            <a class="list-group-item"> Tau Ltd: </a>\
                            <a class="list-group-item"> A Ltp Minimum: </a>\
                            <a class="list-group-item"> A Ltd Minimum: </a>\
                            <a class="list-group-item"> Max Conductance: </a>\
                            <a class="list-group-item"> Reversal Potential: </a>\
                            <a class="list-group-item"> Tau Postsyn. Cond.: </a>\
                            <a class="list-group-item"> Psg Waveform Duration: </a>\
                            <a class="list-group-item"> Delay: </a>\
                   		   </div>';
	}

	var collapseable = '<div class="panel panel-default" style="overflow:visible;">\
                                    <div class="panel-heading">\
                                        <h4 class="panel-title">\
                                            <a id="syn'+dynamicSynNum+'Name" data-toggle="collapse" name="+'+currentModel.synapses[dynamicSynNum].name+'+" onClick="selectSynapseName(name)" data-parent="#synCollapse" href="#syn_'+dynamicSynNum+'">\
                                                '+currentModel.synapses[dynamicSynNum].name+'\
                                            </a>\
                                        </h4>\
                                    </div>\
                                    <div id="syn_'+dynamicSynNum+'" class="panel-collapse collapse in">\
                                        <div class="row">\
                                            <div id="synapses" class="col-lg-5" style="display:block; padding-right: 0px">'+subCollapse+'\
                                            </div>\
                                            <div id="synValues'+dynamicSynNum+'" class="col-lg-7" style="display:block; padding-left: 0px">\
\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

    $('#collapseS').append(collapseable);
    popSynVal(dynamicSynNum);
	dynamicSynNum++;
	makeSynEditable(dynamicSynNum);
	$('#synChoices').selectedIndex = 0;
}

function selectSynapseName(name) {
    var result = $.grep(currentModel.synapses, function(e){return e.name == name; });
    lastSelectSynapse = result[0];
}

function setSynapseVal(value) {
	synapseChoice = value;
}

function fillSynapseBody() {
	var spaces = "-";
	$('#preChoices').html('');
	$('#postChoices').html('');
	fillSynapseNeurons(currentModel, spaces);
	fillSynapseBodyHelp(currentModel, spaces);
}

function fillSynapseBodyHelp(source,spaces) {
	for(var i=0; i<source.cellGroups.length; i++) {
		input = source.cellGroups[i].name;
		$('#preChoices').append('<option value="'+ source.cellGroups[i].name +'" onClick="setSynapsePre(value)">'+ spaces + input+'</option>')
		$('#postChoices').append('<option value="'+ source.cellGroups[i].name+'" onClick="setSynapsePost(value)">'+ spaces + input+'</option>')

		if(source.cellGroups[i].hasOwnProperty('cellGroups')) {
			console.log("1");
			fillSynapseBodyHelp(source.cellGroups[i],spaces + "-");
		}
	}
}

function fillSynapseNeurons(source, spaces) {
	for(var i=0; i<source.neurons.length; i++) {
		input = source.neurons[i].name;
		$('#preChoices').append('<option value="'+ source.neurons[i].name +'" onClick="setSynapsePre(value)">'+ spaces + input+'</option>')
		$('#postChoices').append('<option value="'+ source.neurons[i].name+'" onClick="setSynapsePost(value)">'+ spaces + input+'</option>')
	}
}

function setSynapsePre(value) {
	prePost[0] = value;
}

function setSynapsePost(value) {
	prePost[1] = value;
}

$().ready(function() {
	hideAll()
    $('#elementType').change(function() {
        if($('#elementType').val() === '0') {
            $('.cellGroupTypes').hide();
            $('.neuronTypes').show();
        }
        else if($('#elementType').val() === '1') {
            $('.neuronTypes').hide();
            $('.cellGroupTypes').show();
            $('.neuronChannelType').hide();
        }
        else if($('#elementType').val() === '2') {
            $('.neuronTypes').hide();
            $('.neuronChannelType').hide();
        }

    });
    $('#neuronType').change(function() {
        if($('#neuronType').val() === '0') {
            $('.neuronChannelType').hide();
        }
        else if($('#neuronType').val() === '1') {
            $('.neuronChannelType').show();
        }
        else if($('#neuronType').val() === '2') {
            $('.neuronChannelType').show();
        }
    });
    $('#cellGroupType').change(function() {
        if($('#cellGroupType').val() === '0') {
            $('.cellChannelType').hide();
        }
        else if($('#cellGroupType').val() === '1') {
            $('.cellChannelType').show();
        }
        else if($('#cellGroupType').val() === '2') {
            $('.cellChannelType').show();
        }
    });
});

function addToGlobalModel() {
    // Adding a single neuron to model.
    if($('#elementType').val() === '0') {
        if($('#neuronType').val() === '0') {
            $('.neuronChannelType').hide();
            var newParam = new modelParameters($('#modalneuronName').val(), "Izhikevich", new izhikevichParam(), "Personal");
            currentModel.neurons.push(newParam);
        }
        else if($('#neuronType').val() === '1') {
            $('.neuronChannelType').show();
            if($('#neuronChannelType').val() === '0') {
                var newChan = new voltageGatedIonChannel();
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "NCS", newNcs, "Personal");
                currentModel.neurons.push(newParam);
            }
            if($('#neuronChannelType').val() === '1') {
                var newChan = new calciumDependantChannel();
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "NCS", newNcs, "Personal");
                currentModel.neurons.push(newParam);
            }
            if($('#neuronChannelType').val() === '2') {
                var part = new particleVariableConstants();
                var newPart = new voltageGatedParticle(part, part);
                var newChan = new voltageGatedChannel(newPart);
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "NCS", newNcs, "Personal");
                currentModel.neurons.push(newParam);
            }
        }
        else if($('#neuronType').val() === '2') {
            $('.neuronChannelType').show();
            if($('#neuronChannelType').val() === '0') {
                var newChan = new voltageGatedIonChannel();
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "HodgkinHuxley", newhh, "Personal");
                currentModel.neurons.push(newParam);
            }
            if($('#neuronChannelType').val() === '1') {
                var newChan = new calciumDependantChannel();
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "HodgkinHuxley", newhh, "Personal");
                currentModel.neurons.push(newParam);
            }
            if($('#neuronChannelType').val() === '2') {
                var part = new particleVariableConstants();
                var newPart = new voltageGatedParticle(part, part);
                var newChan = new voltageGatedChannel(newPart);
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalneuronName').val(), "HodgkinHuxley", newhh, "Personal");
                currentModel.neurons.push(newParam);
            }
        }

    }
    // Adding a cellGroup to the model.
    if($('#elementType').val() === '1') {
    	var moveInto = currentModel;
        for(var i=0; i<pos; i++) {
            if(moveInto.cellGroups.length != 0) {
                moveInto = moveInto.cellGroups[indexes[i]]; 
            }
        }
        //console.log(moveInto);
        if($('#cellGroupType').val() === '0') {
            $('.cellChannelType').hide();
                var newParam = new modelParameters($('#modalcellGroupName').val(), "Izhikevich", new izhikevichParam(), "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
        }
        else if($('#cellGroupType').val() === '1') {
            $('.cellChannelType').show();
            if($('#cellChannelType').val() === '0') {
                var newChan = new voltageGatedIonChannel();
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "NCS", newNcs, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
            if($('#cellChannelType').val() === '1') {
                var newChan = new calciumDependantChannel();
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "NCS", newNcs, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
            if($('#cellChannelType').val() === '2') {
                var part = new particleVariableConstants();
                var newPart = new voltageGatedParticle(part, part);
                var newChan = new voltageGatedChannel(newPart);
                var newNcs = new ncsParam();
                newNcs.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "NCS", newNcs, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
        }
        else if($('#cellGroupType').val() === '2') {
            $('.cellChannelType').show();
            if($('#cellChannelType').val() === '0') {
                var newChan = new voltageGatedIonChannel();
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "HodgkinHuxley", newhh, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
            if($('#cellChannelType').val() === '1') {
                var newChan = new calciumDependantChannel();
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "HodgkinHuxley", newhh, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
            if($('#cellChannelType').val() === '2') {
                var part = new particleVariableConstants();
                var newPart = new voltageGatedParticle(part, part);
                var newChan = new voltageGatedChannel(newPart);
                var newhh = new hodgkinHuxleyParam();
                newhh.channel.push(newChan);
                var newParam = new modelParameters($('#modalcellGroupName').val(), "HodgkinHuxley", newhh, "Personal");
                var newCell = new cellGroup($('#modalcellGroupName').val(),  $('#modalcellGroupNum').val(), newParam, "box");
                moveInto.cellGroups.push(newCell);
            }
        }
    }

    updateModelListView();
}

function updateModelListView() {
    angular.element($("#modelList2")).scope().$apply();
}

function updateModelListViewAfterImport() {
    var scope = angular.element($("#modelList2")).scope();
    scope.list2 = currentModel;
    scope.breadGoHome();
    scope.$apply();
}

function hideAddElements() {
    $('.neuronTypes').hide();
    $('.neuronChannelType').hide();
    $('.cellChannelType').hide()
    $('.cellGroupTypes').hide();
}

function addChannel() {
    if($('#addChannelType').val() === '0') {
        var newChan = new voltageGatedIonChannel();
        midMenuLast.parameters.channel.push(newChan);
    }
    else if($('#addChannelType').val() === '1') {
        var newChan = new calciumDependantChannel();
        midMenuLast.parameters.channel.push(newChan);
    }
    else if($('#addChannelType').val() === '2') {
        var part = new particleVariableConstants();
        var newPart = new voltageGatedParticle(part, part);
        var newChan = new voltageGatedChannel(newPart);
        midMenuLast.parameters.channel.push(newChan);
    }
}

function removeElement(id, val) {
	if(val === 0) {
		var result = $.grep(currentModel.neurons, function(e){ return e.name == id; });
		var myIndex = getIndex(currentModel.neurons, "name", result[0].name)
		currentModel.neurons.splice(myIndex, 1);
		midMenuLast = {};
	}
	else {
		if(pos != 0) {
	        var moveInto = currentModel.cellGroups[indexes[0]];
	        for(i=1; i<pos; i++) {
	            if(moveInto.cellGroups.length != 0) {
	                moveInto = moveInto.cellGroups[indexes[i]];
	            }
	        }
			var result = $.grep(moveInto.cellGroups, function(e){ return e.name == id; });
			var myIndex = getIndex(moveInto.cellGroups, "name", result[0].name)
			moveInto.cellGroups.splice(myIndex, 1);
			midMenuLast = {};
		}
		else {
			moveInto = currentModel.cellGroups;
			var result = $.grep(moveInto, function(e){ return e.name == id; });
			var myIndex = getIndex(moveInto, "name", result[0].name)
			moveInto.splice(myIndex, 1);
			midMenuLast = {};
		}

	}
    $('#groupName').html('');
    hideAll();
	updateModelListView();
}

function editWorkingModel() {
	currentModel.name = $('#currentName').val();
	currentModel.description = $('#currentDesc').val();
	currentModel.author = $('#currentAuthor').val();

	$('#currentModelName').html(currentModel.name);
}

