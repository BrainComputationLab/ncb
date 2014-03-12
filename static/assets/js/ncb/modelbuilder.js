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
var indexs = [];
var breadDepth = 1;
var globalCellGroup = [];
var globalCellAlias = [];
var globalSynapseGroup = [];
var dynamicChanNum = 0;
var dynamicSynNum = 0;
var leftMenuLast = {};
var midMenuLast = {};
var aliasid = 0;
var aliasVals = [];
var aliasVal = 0;
var synapseChoice = 1;
var prePost = [null, null]

var ncbApp = angular.module('ncbApp', ['ui.bootstrap', 'mgcrea.ngStrap', 'mgcrea.ngStrap.tooltip', 'colorpicker.module']);



//scope for models in the left menu
function myModelsList($scope) {
    //set the scope to point at myModels
    $scope.list = myModels;

	//set default colors for model list
	$scope.model_color = {personal:'#00568C', database:'#5d6b74'};


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

        // push a new cellgroup into the cellGroup variable
        if(pos == 0) {
            globalCellGroup.push({name: "tempGrp"+inc, num: 1, modelParameters: cloneModel(result[0]), geometry: "box", subGroup: sub});
        }
        else {
            var moveInto = globalCellGroup[indexs[0]];
            for(i=1; i<pos; i++) {
                if(moveInto.subGroup.length != 0 ) {
                    moveInto = moveInto.subGroup[indexs[i]];
                } 
            }
            moveInto.subGroup.push({name: 'tempGrp'+inc, num: 1, modelParameters: cloneModel(result[0]), geometry: 'box', subGroup: sub})
        }
        // increment counter to keep names unique
        inc++;

    };


    // changes color of model depending on if from personal or database
	$scope.styleModel = function(dbType, color) {
    if(dbType == "Personal")        
        return {
                'color': '#FFFFFF',
				'background-color': color.personal
        };
    else if(dbType == "Database")
        return {
                'color': '#FFFFFF',
				'background-color': color.database
		};
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
    // show the first layer of cellgroups added
    $scope.list = globalCellGroup;
    //$scope.list2 = globalCellAlias;
    
    // set the midMenuLast model to the last cellgroup the user clicks on in the middle menu
    $scope.setModel = function (model, num1){
        // if user on home state
        if(pos == 0) {
            // search the array for the model the user clicked on
            if(num1 == 1) {var result = $.grep(globalCellGroup, function(e){ return e.name == model; });}
            if(num1 == 2) {var result = $.grep(globalCellAlias, function(e){ return e.name == model; });}

            // clone the value in midMenuLast
            midMenuLast = {};
            clone(midMenuLast, result[0]);

            // find the index of that value
            if(num1 == 1) {index1 = getIndex(globalCellGroup, "name", midMenuLast.name);}
            if(num1 == 2) {index1 = getIndex(globalCellAlias, "name", midMenuLast.name);}

            // populate the cellgroup parameters on the right corresponding to what the user clicked on
            if(num1 == 1) {popCellP();}
            if(num1 == 2) {popAliasP();}
            return;
        }

        if(num1 == 1) {
	        var moveInto = globalCellGroup[indexs[0]];
	            for(i=1; i<pos; i++) {
	                if(moveInto.subGroup.length != 0 ) {
	                    moveInto = moveInto.subGroup[indexs[i]];
	                } 
	            }

	        // search the subArray and find the name and then the index of that name
	        var result = $.grep(moveInto.subGroup, function(e){ return e.name == model; });
	        midMenuLast = {};
	        clone(midMenuLast, result[0]);
	        index1 = getIndex(moveInto.subGroup, "name", midMenuLast.name);
	        
	        // populate the cellgroup parameters on the right corresponding to what the user clicked on
	        popCellP();
    	}
    	if(num1 == 2) {
    		var moveInto = globalCellAlias[indexs[0]];
	            for(i=1; i<pos; i++) {
	                if(moveInto.cellAlias.length != 0 ) {
	                    moveInto = moveInto.cellAlias[indexs[i]];
	                } 
	            }
	        // search the subArray and find the name and then the index of that name
	        var result = $.grep(moveInto.cellAlias, function(e){ return e.name == model; });
	        midMenuLast = {};
	        clone(midMenuLast, result[0]);
	        index1 = getIndex(moveInto.cellAlias, "name", midMenuLast.name);
    	}
    };
    
    // when the user double clicks on a cellgroup it should set the scope to that cellgroups subgroup.
    $scope.intoModel = function (num1){
        // as the user goes deeper into the subarrays then add to this counter
        pos += 1;

        // when the user double clicks push the index of what they clicked on into the index array
        indexs.push(index1);

        var moveInto = globalCellGroup[indexs[0]];
            for(i=1; i<pos; i++) {
                if(moveInto.subGroup.length != 0 ) {
                    moveInto = moveInto.subGroup[indexs[i]];
                } 
            }

        
        // add the breadcrumb of whatever the user clicked on
        var myStr = $compile('<li><a id="' + breadDepth + '" class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + midMenuLast.name + '</a></li>')($scope);
        $('#bread').append(myStr);
        breadDepth += 1;

        $scope.list = moveInto.subGroup;
        //$scope.list2 = moveIntoA.cellAlias;
    };

    // when the user clicks on home it erases the breadcrumbs and resets the scope to the home level
    $scope.breadGoHome = function (event) {
        // reset the position to the beginning
        pos = 0;

        // reset bread depth
        breadDepth = 1;

        // erase the indexs array
        indexs.length = 0;

        // erase all the breadcrumbs
        $('#bread').html('');

        // recompile the new home breadcrumb because it uses an angular click inside. This is so angular knows it is there.
        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);

        // append the new home button to the breadcrumbs
        $('#bread').append(myStr);

        // reset the scope to home.
        $scope.list = globalCellGroup;
        //$scope.list2 = globalCellAlias;
    };

    $scope.changeBreadcrumb = function (event) {
        var moveInto = globalCellGroup[indexs[0]];
        for(i=1; i<event.target.id; i++) {
            moveInto = moveInto.subGroup[indexs[i]];
        }

        // update breadcrumbs and pos
        breadDepth = +event.target.id + 1;
        pos = +event.target.id;

        // erase all the breadcrumbs
        $('#bread').html('');

        // recompile the new home breadcrumb because it uses an angular click inside. This is so angular knows it is there.
        var myStr = $compile('<li><a id="bc1" class="active" ng-click="breadGoHome()" href="javascript:">Home</a></li>')($scope);

        // append the new home button to the breadcrumbs
        $('#bread').append(myStr);


        var moveInto2 = globalCellGroup[indexs[0]];
        var depth = 1;

        // redraw the correct breadcrumbs
        for(var i=0; i<breadDepth-1; i++) {
            var name = moveInto2.name;
            moveInto2 = moveInto2.subGroup[indexs[i+1]]; 

            var myStr2 = $compile('<li><a id="' + depth + '"class="active" ng-click="changeBreadcrumb($event)" href="javascript:">' + name + '</a></li>')($scope);
            $('#bread').append(myStr2);
            depth += 1;
        }       

        indexs.length = breadDepth - 1;
        
        $scope.list = moveInto.subGroup;
        
    };

}

//scope for the cellaliases in the center menu
function myModelsList3($scope, $compile) {
    $scope.list = globalCellAlias;
}

$().ready( function() {
    hideAll();
    //$('#modelP').click(popModelP);
    //$('#cellP').click(popCellP);
    $('#cellGroupCollapse').show();
    $('#paramCollapse').show();

    $.fn.editable.defaults.mode = 'popup';
});

function popCellP() {
    $('#cellGroupCollapse').show();
    popModelP();

    $('#cellGroupParams').html('');
    $("#cellGroupParams").append('<a id="n1" class="list-group-item">' + midMenuLast.name +'</a>');
    $("#cellGroupParams").append('<a id="n2" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
    $("#cellGroupParams").append('<a id="n3" class="list-group-item">' + midMenuLast.num +'</a>');
    $("#cellGroupParams").append('<a id="n4" class="list-group-item">' + midMenuLast.geometry +'</a>');
    $('#cellGroupParams a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }

                        // search the subArray and find the name and then the index of that name            
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);

                        if(this.id == "n1") { midMenuLast.name = newValue; }
                        if(this.id == "n2") { midMenuLast.modelParameters.name = newValue; }
                        if(this.id == "n3") { midMenuLast.num = newValue; }
                        if(this.id == "n4") { midMenuLast.geometry = newValue; }
                        if(pos == 0) { clone(globalCellGroup[index0], midMenuLast); }
                        else { clone(moveInto3.subGroup[index], midMenuLast); }
                    }
    });
}

function popModelP() {
    showParameterNames();
    var dropChoice = [{ 'value': 0, 'text': 'exact' }, { 'value': 1, 'text': 'uniform' }, { 'value': 2, 'text': 'normal' }];
    var dropChoice2 = [{ 'value': 0, 'text': 'Voltage Gated Ion Channel' }, {'value': 1, 'text': "Calcium Dependant Channel" }, {'value': 2, 'text': "Voltage Gated Channel" }];

    $('#name a').editable({
        'success': function(response, newValue) {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "n11") {midMenuLast.modelParameters.name = newValue}
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
    });
    $('#type2 a').editable({
        'source': dropChoice,
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.a.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.b.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.c.type = dropChoice[newValue].text; }
                        if(this.id == "d1") { swap.d.type = dropChoice[newValue].text; }
                        if(this.id == "u1") { swap.u.type = dropChoice[newValue].text; }
                        if(this.id == "v1") { swap.v.type = dropChoice[newValue].text; }
                        if(this.id == "t1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.restingPotential.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.calcium.type = dropChoice[newValue].text; }
                        if(this.id == "d1") { swap.calciumSpikeIncrement.type = dropChoice[newValue].text; }
                        if(this.id == "e1") { swap.tauCalcium.type = dropChoice[newValue].text; }
                        if(this.id == "f1") { swap.leakReversalPotential.type = dropChoice[newValue].text; }
                        if(this.id == "g1") { swap.tauMembrane.type = dropChoice[newValue].text; }
                        if(this.id == "h1") { swap.rMembrane.type = dropChoice[newValue].text; }
                        if(this.id == "i1") { swap.spikeShape.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(this.id == "b1") { swap.restingPotential.type = dropChoice[newValue].text; }
                        if(this.id == "c1") { swap.capacitence.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    } 
                   }
    });
    $('#value a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.a.value = newValue; }
                        if(this.id == "b2") { swap.b.value = newValue; }
                        if(this.id == "c2") { swap.c.value = newValue; }
                        if(this.id == "d2") { swap.d.value = newValue; }
                        if(this.id == "u2") { swap.u.value = newValue; }
                        if(this.id == "v2") { swap.v.value = newValue; }
                        if(this.id == "t2") { swap.threshold.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.threshold.value = newValue; }
                        if(this.id == "b2") { swap.restingPotential.value = newValue; }
                        if(this.id == "c2") { swap.calcium.value = newValue; }
                        if(this.id == "d2") { swap.calciumSpikeIncrement.value = newValue; }
                        if(this.id == "e2") { swap.tauCalcium.value = newValue; }
                        if(this.id == "f2") { swap.leakReversalPotential.value = newValue; }
                        if(this.id == "g2") { swap.tauMembrane.value = newValue; }
                        if(this.id == "h2") { swap.rMembrane.value = newValue; }
                        if(this.id == "i2") { swap.spikeShape.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a2") { swap.threshold.value = newValue; }
                        if(this.id == "b2") { swap.restingPotential.value = newValue; }
                        if(this.id == "c2") { swap.capacitence.value = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    $('#minvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }

                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);         
                        if(this.id == "a3") { swap.a.minValue = newValue; }
                        if(this.id == "b3") { swap.b.minValue = newValue; }
                        if(this.id == "c3") { swap.c.minValue = newValue; }
                        if(this.id == "d3") { swap.d.minValue = newValue; }
                        if(this.id == "u3") { swap.u.minValue = newValue; }
                        if(this.id == "v3") { swap.v.minValue = newValue; }
                        if(this.id == "t3") { swap.threshold.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a3") { swap.threshold.minValue = newValue; }
                        if(this.id == "b3") { swap.restingPotential.minValue = newValue; }
                        if(this.id == "c3") { swap.calcium.minValue = newValue; }
                        if(this.id == "d3") { swap.calciumSpikeIncrement.minValue = newValue; }
                        if(this.id == "e3") { swap.tauCalcium.minValue = newValue; }
                        if(this.id == "f3") { swap.leakReversalPotential.minValue = newValue; }
                        if(this.id == "g3") { swap.tauMembrane.minValue = newValue; }
                        if(this.id == "h3") { swap.rMembrane.minValue = newValue; }
                        if(this.id == "i3") { swap.spikeShape.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a3") { swap.threshold.minValue = newValue; }
                        if(this.id == "b3") { swap.restingPotential.minValue = newValue; }
                        if(this.id == "c3") { swap.capacitence.minValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    $('#maxvalue a').editable({
        'success': function(response, newValue) {
                    if(midMenuLast.modelParameters.type === "Izhikevich") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }

                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.a.maxValue = newValue; }
                        if(this.id == "b4") { swap.b.maxValue = newValue; }
                        if(this.id == "c4") { swap.c.maxValue = newValue; }
                        if(this.id == "d4") { swap.d.maxValue = newValue; }
                        if(this.id == "u4") { swap.u.maxValue = newValue; }
                        if(this.id == "v4") { swap.v.maxValue = newValue; }
                        if(this.id == "t4") { swap.threshold.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "NCS") { 
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.threshold.maxValue = newValue; }
                        if(this.id == "b4") { swap.restingPotential.maxValue = newValue; }
                        if(this.id == "c4") { swap.calcium.maxValue = newValue; }
                        if(this.id == "d4") { swap.calciumSpikeIncrement.maxValue = newValue; }
                        if(this.id == "e4") { swap.tauCalcium.maxValue = newValue; }
                        if(this.id == "f4") { swap.leakReversalPotential.maxValue = newValue; }
                        if(this.id == "g4") { swap.tauMembrane.maxValue = newValue; }
                        if(this.id == "h4") { swap.rMembrane.maxValue = newValue; }
                        if(this.id == "i4") { swap.spikeShape.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
                        
                        for(i=1; i<pos; i++) {
                            if(moveInto3.subGroup.length != 0 ) {
                                moveInto3 = moveInto3.subGroup[indexs[i]];
                            } 
                        }
                        
                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters);
                        if(this.id == "a4") { swap.threshold.maxValue = newValue; }
                        if(this.id == "b4") { swap.restingPotential.maxValue = newValue; }
                        if(this.id == "c4") { swap.capacitence.maxValue = newValue; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
                        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
                        delete swap;
                    }
                   }
    });
    for(var x=0; x<dynamicChanNum; x++) {
	    $('#channeltype'+x).editable({
	        'source': dropChoice2,
	        'success': function(response, newValue) {
	                if (typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                else { var moveInto3 = globalCellGroup[indexs[0]]; }

	                for (i = 1; i < pos; i++) {
	                    if (moveInto3.subGroup.length != 0) {
	                        moveInto3 = moveInto3.subGroup[indexs[i]];
	                    }
	                }
	                var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                if (newValue == 0) { var swap = new voltageGatedIonChannel(); }
	                else if (newValue == 1) { var swap = new calciumDependantChannel(); }
	                else if (newValue == 2) { var swap = new voltageGatedChannel(testParticle); }

	                if (pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel = $.extend(true, {}, swap); }
	                else { moveInto3.subGroup[index].modelParameters.parameters.channel = $.extend(true, {}, swap); }
	                delete swap;
	            }
	    });
	    $('#chantype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
	        			var thisVal = this.id.slice(-1);
	                    if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha1"+thisVal) { swap.vHalf.type = dropChoice[newValue].text; }
	                        if(this.id == "chb1"+thisVal) { swap.r.type = dropChoice[newValue].text;}
	                        if(this.id == "chc1"+thisVal) { swap.activationSlope.type = dropChoice[newValue].text; }
	                        if(this.id == "chd1"+thisVal) { swap.deactivationSlope.type = dropChoice[newValue].text; }
	                        if(this.id == "che1"+thisVal) { swap.equilibriumSlope.type = dropChoice[newValue].text; }
	                        if(this.id == "chf1"+thisVal) { swap.conductance.type = dropChoice[newValue].text; }
	                        if(this.id == "chg1"+thisVal) { swap.reversalPotential.type = dropChoice[newValue].text; }
	                        if(this.id == "chh1"+thisVal) { swap.mInitial.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha1"+thisVal) { swap.mInitial.type = dropChoice[newValue].text; }
	                        if(this.id == "chb1"+thisVal) { swap.reversalPotential.type = dropChoice[newValue].text; }
	                        if(this.id == "chc1"+thisVal) { swap.backwardsRate.type = dropChoice[newValue].text; }
	                        if(this.id == "chd1"+thisVal) { swap.forwardScale.type = dropChoice[newValue].text; }
	                        if(this.id == "che1"+thisVal) { swap.forwardExponent.type = dropChoice[newValue].text; }
	                        if(this.id == "chf1"+thisVal) { swap.tauScale.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha1"+thisVal) { swap.conductance.type = dropChoice[newValue].text; }
	                        if(this.id == "chb1"+thisVal) { swap.reversePotential.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	            }
	    });
	    $('#chanvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        		    var thisVal = this.id.slice(-1);
	                    if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha2"+thisVal) { swap.vHalf.value = newValue; }
	                        if(this.id == "chb2"+thisVal) { swap.r.value = newValue; }
	                        if(this.id == "chc2"+thisVal) { swap.activationSlope.value = newValue; }
	                        if(this.id == "chd2"+thisVal) { swap.deactivationSlope.value = newValue; }
	                        if(this.id == "che2"+thisVal) { swap.equilibriumSlope.value = newValue; }
	                        if(this.id == "chf2"+thisVal) { swap.conductance.value = newValue; }
	                        if(this.id == "chg2"+thisVal) { swap.reversalPotential.value = newValue; }
	                        if(this.id == "chh2"+thisVal) { swap.mInitial.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha2"+thisVal) { swap.mInitial.value = newValue; }
	                        if(this.id == "chb2"+thisVal) { swap.reversalPotential.value = newValue; }
	                        if(this.id == "chc2"+thisVal) { swap.backwardsRate.value = newValue; }
	                        if(this.id == "chd2"+thisVal) { swap.forwardScale.value = newValue; }
	                        if(this.id == "che2"+thisVal) { swap.forwardExponent.value = newValue; }
	                        if(this.id == "chf2"+thisVal) { swap.tauScale.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha2"+thisVal) { swap.conductance.value = newValue; }
	                        if(this.id == "chb2"+thisVal) { swap.reversePotential.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	            }
	    });
	    $('#chanminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        			var thisVal = this.id.slice(-1);
	                    if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha3"+thisVal) { swap.vHalf.minValue = newValue; }
	                        if(this.id == "chb3"+thisVal) { swap.r.minValue = newValue; }
	                        if(this.id == "chc3"+thisVal) { swap.activationSlope.minValue = newValue; }
	                        if(this.id == "chd3"+thisVal) { swap.deactivationSlope.minValue = newValue; }
	                        if(this.id == "che3"+thisVal) { swap.equilibriumSlope.minValue = newValue; }
	                        if(this.id == "chf3"+thisVal) { swap.conductance.minValue = newValue; }
	                        if(this.id == "chg3"+thisVal) { swap.reversalPotential.minValue = newValue; }
	                        if(this.id == "chh3"+thisVal) { swap.mInitial.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha3"+thisVal) { swap.mInitial.minValue = newValue; }
	                        if(this.id == "chb3"+thisVal) { swap.reversalPotential.minValue = newValue; }
	                        if(this.id == "chc3"+thisVal) { swap.backwardsRate.minValue = newValue; }
	                        if(this.id == "chd3"+thisVal) { swap.forwardScale.minValue = newValue; }
	                        if(this.id == "che3"+thisVal) { swap.forwardExponent.minValue = newValue; }
	                        if(this.id == "chf3"+thisVal) { swap.tauScale.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha3"+thisVal) { swap.conductance.minValue = newValue; }
	                        if(this.id == "chb3"+thisVal) { swap.reversePotential.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	            }
	    });
	    $('#chanmaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        			var thisVal = this.id.slice(-1);
	                    if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated Ion Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha4"+thisVal) { swap.vHalf.maxValue = newValue; }
	                        if(this.id == "chb4"+thisVal) { swap.r.maxValue = newValue; }
	                        if(this.id == "chc4"+thisVal) { swap.activationSlope.maxValue = newValue; }
	                        if(this.id == "chd4"+thisVal) { swap.deactivationSlope.maxValue = newValue; }
	                        if(this.id == "che4"+thisVal) { swap.equilibriumSlope.maxValue = newValue; }
	                        if(this.id == "chf4"+thisVal) { swap.conductance.maxValue = newValue; }
	                        if(this.id == "chg4"+thisVal) { swap.reversalPotential.maxValue = newValue; }
	                        if(this.id == "chh4"+thisVal) { swap.mInitial.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Calcium Dependant Channel") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha4"+thisVal) { swap.mInitial.maxValue = newValue; }
	                        if(this.id == "chb4"+thisVal) { swap.reversalPotential.maxValue = newValue; }
	                        if(this.id == "chc4"+thisVal) { swap.backwardsRate.maxValue = newValue; }
	                        if(this.id == "chd4"+thisVal) { swap.forwardScale.maxValue = newValue; }
	                        if(this.id == "che4"+thisVal) { swap.forwardExponent.maxValue = newValue; }
	                        if(this.id == "chf4"+thisVal) { swap.tauScale.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	                    else if(midMenuLast.modelParameters.parameters.channel[thisVal].name === "Voltage Gated channel[thisVal]") {
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal]);
	                        if(this.id == "cha4"+thisVal) { swap.conductance.maxValue = newValue; }
	                        if(this.id == "chb4"+thisVal) { swap.reversePotential.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal] = $.extend(true, {}, swap); }
	                        delete swap;
	                    }
	            }
	    });
	    $('#particletype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles);
	                        if(this.id == "pa1"+thisVal) { swap.power.type = dropChoice[newValue].text; }
	                        if(this.id == "pb1"+thisVal) { swap.xInitial.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#particlevalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles);
	                        if(this.id == "pa2"+thisVal) { swap.power.value = newValue; }
	                        if(this.id == "pb2"+thisVal) { swap.xInitial.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#particleminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles);
	                        if(this.id == "pa3"+thisVal) { swap.power.minValue = newValue; }
	                        if(this.id == "pb3"+thisVal) { swap.xInitial.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#particlemaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles);
	                        if(this.id == "pa4"+thisVal) { swap.power.maxValue = newValue; }
	                        if(this.id == "pb4"+thisVal) { swap.xInitial.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constanttype'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.alpha);
	                        if(this.id == "ca1"+thisVal) { swap.a.type = dropChoice[newValue].text; }
	                        if(this.id == "cb1"+thisVal) { swap.b.type = dropChoice[newValue].text; }
	                        if(this.id == "cc1"+thisVal) { swap.c.type = dropChoice[newValue].text; }
	                        if(this.id == "cd1"+thisVal) { swap.d.type = dropChoice[newValue].text; }
	                        if(this.id == "cf1"+thisVal) { swap.f.type = dropChoice[newValue].text; }
	                        if(this.id == "ch1"+thisVal) { swap.h.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.alpha);
	                        if(this.id == "ca2"+thisVal) { swap.a.value = newValue; }
	                        if(this.id == "cb2"+thisVal) { swap.b.value = newValue; }
	                        if(this.id == "cc2"+thisVal) { swap.c.value = newValue; }
	                        if(this.id == "cd2"+thisVal) { swap.d.value = newValue; }
	                        if(this.id == "cf2"+thisVal) { swap.f.value = newValue; }
	                        if(this.id == "ch2"+thisVal) { swap.h.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantminvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.alpha);
	                        if(this.id == "ca3"+thisVal) { swap.a.minValue = newValue; }
	                        if(this.id == "cb3"+thisVal) { swap.b.minValue = newValue; }
	                        if(this.id == "cc3"+thisVal) { swap.c.minValue = newValue; }
	                        if(this.id == "cd3"+thisVal) { swap.d.minValue = newValue; }
	                        if(this.id == "cf3"+thisVal) { swap.f.minValue = newValue; }
	                        if(this.id == "ch3"+thisVal) { swap.h.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantmaxvalue'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.alpha);
	                        if(this.id == "ca4"+thisVal) { swap.a.maxValue = newValue; }
	                        if(this.id == "cb4"+thisVal) { swap.b.maxValue = newValue; }
	                        if(this.id == "cc4"+thisVal) { swap.c.maxValue = newValue; }
	                        if(this.id == "cd4"+thisVal) { swap.d.maxValue = newValue; }
	                        if(this.id == "cf4"+thisVal) { swap.f.maxValue = newValue; }
	                        if(this.id == "ch4"+thisVal) { swap.h.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.alpha = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constanttype2'+x+' a').editable({
	        'source': dropChoice,
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.beta);
	                        if(this.id == "cba1"+thisVal) { swap.a.type = dropChoice[newValue].text; }
	                        if(this.id == "cbb1"+thisVal) { swap.b.type = dropChoice[newValue].text; }
	                        if(this.id == "cbc1"+thisVal) { swap.c.type = dropChoice[newValue].text; }
	                        if(this.id == "cbd1"+thisVal) { swap.d.type = dropChoice[newValue].text; }
	                        if(this.id == "cbf1"+thisVal) { swap.f.type = dropChoice[newValue].text; }
	                        if(this.id == "cbh1"+thisVal) { swap.h.type = dropChoice[newValue].text; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.beta);
	                        if(this.id == "cba2"+thisVal) { swap.a.value = newValue; }
	                        if(this.id == "cbb2"+thisVal) { swap.b.value = newValue; }
	                        if(this.id == "cbc2"+thisVal) { swap.c.value = newValue; }
	                        if(this.id == "cbd2"+thisVal) { swap.d.value = newValue; }
	                        if(this.id == "cbf2"+thisVal) { swap.f.value = newValue; }
	                        if(this.id == "cbh2"+thisVal) { swap.h.value = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantminvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.beta);
	                        if(this.id == "cba3"+thisVal) { swap.a.minValue = newValue; }
	                        if(this.id == "cbb3"+thisVal) { swap.b.minValue = newValue; }
	                        if(this.id == "cbc3"+thisVal) { swap.c.minValue = newValue; }
	                        if(this.id == "cbd3"+thisVal) { swap.d.minValue = newValue; }
	                        if(this.id == "cbf3"+thisVal) { swap.f.minValue = newValue; }
	                        if(this.id == "cbh3"+thisVal) { swap.h.minValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	    $('#constantmaxvalue2'+x+' a').editable({
	        'success': function(response, newValue) {
	        				var thisVal = this.id.slice(-1);
	                        if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
	                        else { var moveInto3 = globalCellGroup[indexs[0]]; }
	                        
	                        for(i=1; i<pos; i++) {
	                            if(moveInto3.subGroup.length != 0 ) {
	                                moveInto3 = moveInto3.subGroup[indexs[i]];
	                            } 
	                        }
	                        
	                        var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
	                        var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);
	                        var swap = jQuery.extend(true, {}, midMenuLast.modelParameters.parameters.channel[thisVal].particles.beta);
	                        if(this.id == "cba4"+thisVal) { swap.a.maxValue = newValue; }
	                        if(this.id == "cbb4"+thisVal) { swap.b.maxValue = newValue; }
	                        if(this.id == "cbc4"+thisVal) { swap.c.maxValue = newValue; }
	                        if(this.id == "cbd4"+thisVal) { swap.d.maxValue = newValue; }
	                        if(this.id == "cbf4"+thisVal) { swap.f.maxValue = newValue; }
	                        if(this.id == "cbh4"+thisVal) { swap.h.maxValue = newValue; }
	                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        else { moveInto3.subGroup[index].modelParameters.parameters.channel[thisVal].particles.beta = $.extend(true, {}, swap); }
	                        delete swap;
	            }
	    });
	}

}




function showParameterNames() {
    hideAll();

    $('#collapse2').html('');
    dynamicChanNum = 0;
    $('#groupName').html(midMenuLast.name + ' Parameters');

    $('#paramCollapse').show();
    $('#cellGroupCollapse').show();

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

    if(midMenuLast.modelParameters.type === "Izhikevich") {
        $('#izParam').show();
        $('#parameterValues').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.a.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.a.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.b.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.c.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.d.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.maxValue +'</a>');

        $("#type2").append('<a id="u1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.u.type +'</a>');
        $("#value").append('<a id="u2" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.value +'</a>');
        $("#minvalue").append('<a id="u3" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.minValue +'</a>');
        $("#maxvalue").append('<a id="u4" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.maxValue +'</a>');

        $("#type2").append('<a id="v1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.v.type +'</a>');
        $("#value").append('<a id="v2" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.value +'</a>');
        $("#minvalue").append('<a id="v3" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.minValue +'</a>');
        $("#maxvalue").append('<a id="v4" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.maxValue +'</a>');

        $("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

    }
    else if(midMenuLast.modelParameters.type === "NCS") {
        $('#ncsParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        //$('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calcium.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.maxValue +'</a>');

        $("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.type +'</a>');
        $("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.value +'</a>');
        $("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.minValue +'</a>');
        $("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.maxValue +'</a>');

        $("#type2").append('<a id="e1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauCalcium.type +'</a>');
        $("#value").append('<a id="e2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.value +'</a>');
        $("#minvalue").append('<a id="e3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.minValue +'</a>');
        $("#maxvalue").append('<a id="e4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.maxValue +'</a>');

        $("#type2").append('<a id="f1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.leakReversalPotential.type +'</a>');
        $("#value").append('<a id="f2" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.value +'</a>');
        $("#minvalue").append('<a id="f3" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="f4" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.maxValue +'</a>');

        $("#type2").append('<a id="g1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauMembrane.type +'</a>');
        $("#value").append('<a id="g2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.value +'</a>');
        $("#minvalue").append('<a id="g3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="g4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.maxValue +'</a>');

        $("#type2").append('<a id="h1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.rMembrane.type +'</a>');
        $("#value").append('<a id="h2" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.value +'</a>');
        $("#minvalue").append('<a id="h3" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.minValue +'</a>');
        $("#maxvalue").append('<a id="h4" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.maxValue +'</a>');

        $("#type2").append('<a id="i1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.spikeShape.type +'</a>');
        $("#value").append('<a id="i2" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.value +'</a>');
        $("#minvalue").append('<a id="i3" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.minValue +'</a>');
        $("#maxvalue").append('<a id="i4" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.maxValue +'</a>');

        $('#collapse2').html('');
        for(var i=0; i<midMenuLast.modelParameters.parameters.channel.length; i++) {
            var num = dynamicChanNum;
            chanCollapseAdd();
            hideChanParam();
            $('#vgiChan'+num).hide();
            $('#vgChan'+num).hide();
            $('#cdChan'+num).hide();
            $('#particleCollapse'+num).hide();

            $('#chan'+num+'Name').empty();
            $('#chan'+num+'Name').append(midMenuLast.modelParameters.parameters.channel[i].name);

            showChannelParams(midMenuLast.modelParameters.parameters.channel[i], i);
        }
    }
    else if(midMenuLast.modelParameters.type === "HodgkinHuxley") {
        $('#hhParam').show();
        $('#parameterValues').show();
        $('#chanCollapse').show();
        $('#channelName').show();
        $('#p1').hide();

        $("#name").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
        $("#type1").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');

        $("#type2").append('<a class="list-group-item"> <span style="text-decoration: underline;">Type</span></a>');
        $("#value").append('<a class="list-group-item"> <span style="text-decoration: underline;">Value</span></a>');
        $("#minvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Min</span></a>');
        $("#maxvalue").append('<a class="list-group-item"> <span style="text-decoration: underline;">Max</span></a>');

        $("#type2").append('<a id="a1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.threshold.type +'</a>');
        $("#value").append('<a id="a2" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
        $("#minvalue").append('<a id="a3" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.minValue +'</a>');
        $("#maxvalue").append('<a id="a4" class="list-group-item" data-type="number">' + midMenuLast.modelParameters.parameters.threshold.maxValue +'</a>');

        $("#type2").append('<a id="b1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.restingPotential.type +'</a>');
        $("#value").append('<a id="b2" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.value +'</a>');
        $("#minvalue").append('<a id="b3" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.minValue +'</a>');
        $("#maxvalue").append('<a id="b4" class="list-group-item">' + midMenuLast.modelParameters.parameters.restingPotential.maxValue +'</a>');

        $("#type2").append('<a id="c1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.capacitence.type +'</a>');
        $("#value").append('<a id="c2" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.value +'</a>');
        $("#minvalue").append('<a id="c3" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.minValue +'</a>');
        $("#maxvalue").append('<a id="c4" class="list-group-item">' + midMenuLast.modelParameters.parameters.capacitence.maxValue +'</a>');

        $('#collapse2').html('');
        for(var i=0; i<midMenuLast.modelParameters.parameters.channel.length; i++) {
            var num = dynamicChanNum;
            chanCollapseAdd();
            hideChanParam();
            $('#vgiChan'+num).hide();
            $('#vgChan'+num).hide();
            $('#cdChan'+num).hide();
            $('#particleCollapse'+num).hide();

            $('#chan'+num+'Name').empty();
            $('#chan'+num+'Name').append(midMenuLast.modelParameters.parameters.channel[i].name);

            showChannelParams(midMenuLast.modelParameters.parameters.channel[i], i);
        }
    }

}

function showChannelParams(source, val) {
    $('#channelValues'+val).html('');
    $('#channelValues'+val).show();
    $('#channelValues'+val).append('<div class="row">');
    $('#channelValues'+val).append('<div id="chantype'+val+'" class="col-lg-3"></div>');
    $('#channelValues'+val).append('<div id="chanvalue'+val+'" class="col-lg-3"></div>');
    $('#channelValues'+val).append('<div id="chanminvalue'+val+'" class="col-lg-3"></div>');
    $('#channelValues'+val).append('<div id="chanmaxvalue'+val+'" class="col-lg-3"></div>');
    $('#channelValues'+val).append('</div>');

    if(source.name === "Voltage Gated Ion Channel") {
        $('#vgiChan'+val).show();
        $("#chantype"+val).append('<a id="cha1'+val+'" class="list-group-item"  data-type="select" >' + source.vHalf.type +'</a>');
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
    $('#particleValues'+val).append('<div id="particletype'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="particlevalue'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="particleminvalue'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="particlemaxvalue'+val+'" class="col-lg-3"></div>');
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
    $('#particleValues'+val).append('<div id="constanttype'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantvalue'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantminvalue'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantmaxvalue'+val+'" class="col-lg-3"></div>');
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
    $('#particleValues'+val).append('<div id="constanttype2'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantvalue2'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantminvalue2'+val+'" class="col-lg-3"></div>');
    $('#particleValues'+val).append('<div id="constantmaxvalue2'+val+'" class="col-lg-3"></div>');
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
	console.log(globalSynapseGroup[val].pre);
	$('#synValues'+val).append('<div id=synpre'+val+' class="col-lg-12"></div>');
	$('#synValues'+val).append('<div id=synpost'+val+' class="col-lg-12"></div>');
	$('#synValues'+val).append('<div id=synprob'+val+' class="col-lg-12"></div>');
	$('#synpre'+val).append('<a id="spre'+val+'" class="list-group-item">' + globalSynapseGroup[val].pre +'</a>');
	$('#synpost'+val).append('<a id="spost'+val+'" class="list-group-item">' + globalSynapseGroup[val].post +'</a>');
	$('#synprob'+val).append('<a id="sname'+val+'" class="list-group-item">' + globalSynapseGroup[val].prob +'</a>');
    $('#synValues'+val).append('<div class="row">');
    $('#synValues'+val).append('<div id="syntype'+val+'" class="col-lg-3"></div>');
    $('#synValues'+val).append('<div id="synvalue'+val+'" class="col-lg-3"></div>');
    $('#synValues'+val).append('<div id="synminvalue'+val+'" class="col-lg-3"></div>');
    $('#synValues'+val).append('<div id="synmaxvalue'+val+'" class="col-lg-3"></div>');
    $('#synValues'+val).append('</div>');

    if(globalSynapseGroup[val].parameters.name === 'flatSynapse') {
	    $("#syntype"+val).append('<a id="s1'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.delay.type +'</a>');
	    $("#synvalue"+val).append('<a id="s2'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s3'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s4'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.current.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.current.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.current.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.current.maxValue +'</a>');
	}
	if(globalSynapseGroup[val].parameters.name === 'ncsSynapse') {
	    $("#syntype"+val).append('<a id="s1'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.utilization.type +'</a>');
	    $("#synvalue"+val).append('<a id="s2'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.utilization.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s3'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.utilization.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s4'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.utilization.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.redistribution.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.redistribution.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.redistribution.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.redistribution.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.lastPrefireTime.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPrefireTime.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPrefireTime.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPrefireTime.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.lastPostfireTime.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPostfireTime.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPostfireTime.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.lastPostfireTime.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.tauFacilitation.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauFacilitation.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauFacilitation.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauFacilitation.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.tauDepression.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauDepression.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauDepression.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauDepression.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.tauLtp.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtp.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtp.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtp.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.tauLtd.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtd.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtd.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauLtd.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.aLtpMinimum.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.aLtpMinimum.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.aLtpMinimum.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.aLtpMinimum.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.maxConductance.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.maxConductance.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.maxConductance.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.maxConductance.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.reversalPotential.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.reversalPotential.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.reversalPotential.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.reversalPotential.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.tauPostSynapticConductance.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauPostSynapticConductance.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauPostSynapticConductance.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.tauPostSynapticConductance.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.psgWaveformDuration.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.psgWaveformDuration.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.psgWaveformDuration.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.psgWaveformDuration.maxValue +'</a>');

	    $("#syntype"+val).append('<a id="s21'+val+'" class="list-group-item" data-type="select">' + globalSynapseGroup[val].parameters.delay.type +'</a>');
	    $("#synvalue"+val).append('<a id="s22'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.value +'</a>');
	    $("#synminvalue"+val).append('<a id="s23'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.minValue +'</a>');
	    $("#synmaxvalue"+val).append('<a id="s24'+val+'" class="list-group-item" data-type="number">' + globalSynapseGroup[val].parameters.delay.maxValue +'</a>');
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
                                            <div id="channels" class="col-lg-5">\
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
                                            <div id="channelValues'+dynamicChanNum+'" class="col-lg-7">\
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
                                                    <div id="particles'+dynamicChanNum+'" class="col-lg-5">\
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
                                                    <div id="particleValues'+dynamicChanNum+'" class="col-lg-7">\
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

function popAliasP() {
	console.log("yay");
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
        for(var i=0; i<source.length; i++) {
            ret.channel[i] = cloneChan(source.channel[i]);
        }
        return ret;
    }
    else if(source.className === "hodgkinHuxleyParam") {
        var ret = new hodgkinHuxleyParam();
        clone(ret, source);
        for(var i=0; i<source.length; i++) {
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

function popChanModal(val) {
    if(typeof indexs[0] === 'undefined') { var moveInto3 = globalCellGroup[0]; }
    else { var moveInto3 = globalCellGroup[indexs[0]]; }
    
    for(i=1; i<pos; i++) {
        if(moveInto3.subGroup.length != 0 ) {
            moveInto3 = moveInto3.subGroup[indexs[i]];
        } 
    }
    var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);
    var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);

    if(val == 1) {
        var newChan = new voltageGatedIonChannel();
    }
    else if(val == 2) {
        var newChan = new calciumDependantChannel();
    }
    else if(val == 3) {
        var a1 = new particleVariableConstants();
        var b1 = new particleVariableConstants();
        var testParticle = new voltageGatedParticle(a1, b1);
        var newChan = new voltageGatedChannel(testParticle);
    }

    if(pos == 0) { 
        newChanPos = globalCellGroup[index0].modelParameters.parameters.channel.length;
        globalCellGroup[index0].modelParameters.parameters.channel[newChanPos] = cloneChan(newChan);
    }
    else { 
        var newChanPos = moveInto3.modelParameters.parameters.channel.length;
        moveInto3.subGroup[index].modelParameters.parameters.channel[newChanPos] = cloneChan(newChan); 
    }
    return;
}


function fillAliasBody() {
	$("#aliasbody").html('');
	aliasid = 0;
	for(var i=0; i<globalCellGroup.length; i++) {
		printAlias(globalCellGroup[i], aliasid);
	}
}

function printAlias(source, id) {
	$("#aliasbody").append('<a id="'+source.name+'" class="list-group-item" onClick="toggleChoice(this)" data-type="select">'+source.name+'</a>')
	aliasid++;
	if(source.hasOwnProperty('subGroup')) {
		for(var i=0; i<source.subGroup.length; i++) {
			printAlias(source.subGroup[i]);
		}
	}

}

function addToAlias() {
	var cgroup1 = [];
	for(var i=0; i<aliasVals.length; i++) {
		for(var j=0; j<globalCellGroup.length; j++) {
			var source = addToAliasSearch(globalCellGroup[j], aliasVals[i]);
			if(source != -1) {
				cgroup1.push(source);
			}
		}
	}
	var cgroup2 = new cellGroup();
	cgroup2.name = 'hi';
	cgroup2.subGroup = cgroup1;

	globalCellAlias.push({name: 'alias'+aliasVal, cellGroup: cgroup2, cellAlias: null});
	aliasVal++;
	aliasVals.length = 0;
}

function addToAliasSearch(source, x) {
	if(source.name === x) {
		return source;
	}
	if(source.hasOwnProperty('subGroup')) {
		for(var i=0; i<source.subGroup.length; i++) {
			addToAliasSearch(source.subGroup[i], x);
		}
	}
	return -1;
}

function toggleChoice(id) {
	$('#'+$(id).attr('id')).append(' Added to Alias!');
	aliasVals.push($(id).attr('id'));
}

function createSynapse() {
	if(synapseChoice == 1) {
		var params = new flatSynapse();
		globalSynapseGroup.push({name: $('#synapName').val(), pre: prePost[0], post: prePost[1], prob: $('#probOfConnection').val(), parameters: params});
		var subCollapse = '<div id="flatsyn'+dynamicSynNum+'">\
		                    <a class="list-group-item"> PreSynaptic: </a>\
		                    <a class="list-group-item"> PostSynaptic: </a>\
		                    <a class="list-group-item"> Probability: </a>\
		                    <a class="list-group-item"> Delay: </a>\
		                    <a class="list-group-item"> Current: </a>\
		                   </div>';
	}
	else if(synapseChoice == 2) {
		globalSynapseGroup.push(new synapseGroup($('#synapName').val(), prePost[0], prePost[1], $('#probOfConnection').val(), new ncsSynapse()));
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
                                            <a id="syn'+dynamicSynNum+'Name" data-toggle="collapse" data-parent="#synCollapse" href="#syn_'+dynamicSynNum+'">\
                                                '+globalSynapseGroup[dynamicSynNum].name+'\
                                            </a>\
                                        </h4>\
                                    </div>\
                                    <div id="syn_'+dynamicSynNum+'" class="panel-collapse collapse in">\
                                        <div class="row">\
                                            <div id="synapses" class="col-lg-5">'+subCollapse+'\
                                            </div>\
                                            <div id="synValues'+dynamicSynNum+'" class="col-lg-7">\
\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

    $('#collapseS').append(collapseable);
    popSynVal(dynamicSynNum);
	dynamicSynNum++;
	$('#synChoices').selectedIndex = 0;
}

function setSynapseVal(value) {
	synapseChoice = value;
}

function fillSynapseBody() {
	$('#preChoices').html('');
	$('#postChoices').html('');
	fillSynapseBodyHelp(globalCellGroup);
}

function fillSynapseBodyHelp(source) {
	for(var i=0; i<source.length; i++) {
		$('#preChoices').append('<option value="'+source[i].name+'" onClick="setSynapsePre(value)">'+source[i].name+'</option>')
		$('#postChoices').append('<option value="'+source[i].name+'" onClick="setSynapsePost(value)">'+source[i].name+'</option>')
		if(source[i].hasOwnProperty('subGroup')) {
			fillSynapseBodyHelp(source[i].subGroup);
		}
	}
}

function setSynapsePre(value) {
	prePost[0] = value;
}

function setSynapsePost(value) {
	prePost[1] = value;
}