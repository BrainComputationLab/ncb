//test models
var testChannel1 = new voltageGatedIonChannel();
var testChannel2 = new calciumDependantChannel();
var testParam = new izhikevichParam();
var testParam2 = new izhikevichParam();
var test2Param = new ncsParam(testChannel1);
var test3Param = new hodgkinHuxleyParam(testChannel2);
var myModels = [
	new modelParameters('I_Cell_1', 'Izhikevich', testParam, 'Database'),
	new modelParameters('I_Cell_2', 'Izhikevich', testParam, 'Personal'),
	new modelParameters('I_Cell_3', 'Izhikevich', testParam, 'Personal'), 
	new modelParameters('I_Cell_4', 'Izhikevich', testParam, 'Database'),
	new modelParameters('I_Cell_4', 'Izhikevich', testParam, 'Personal'),
    new modelParameters('NCS_Cell_1', 'NCS', test2Param, 'Personal'),
    new modelParameters('HH_Cell_1', 'HodgkinHuxley', test3Param, 'Database'),
];

// variables needed for implementation
var inc = 0;
var pos = 0;
var value = 0;
var index1 = 0;
var indexs = [];
var breadDepth = 1;
var globalCellGroup = [];

angular.module('ncbApp', ['ui.bootstrap']);

//scope for models in the left menu
function myModelsList($scope) {
	//set the scope to point at myModels
	$scope.list = myModels;

	//sets the leftMenuLast model to the last model the user clicks on
	$scope.setModel = function (model){
		var result = $.grep(myModels, function(e){ return e.name == model; });
		leftMenuLast = clone(result[0]);
	};

	//when the user dblclicks or drags the model from the left menu to the right menu, it pushes the model into the cellgroup variable which represents the center menu.
	$scope.moveModel = function (model) {
		var result = $.grep(myModels, function(e){ return e.name == model; });
		var sub = [];

		// push a new cellgroup into the cellGroup variable
		if(pos == 0) {
			globalCellGroup.push({name: "tempGrp"+inc, num: 1, modelParameters: clone(result[0]), geometry: "box", subGroup: sub});
		}
		else {
			var moveInto = globalCellGroup[indexs[0]];
			for(i=1; i<pos; i++) {
				if(moveInto.subGroup.length != 0 ) {
					moveInto = moveInto.subGroup[indexs[i]];
				} 
			}
			moveInto.subGroup.push({name: 'tempGrp'+inc, num: 1, modelParameters: clone(result[0]), geometry: 'box', subGroup: sub})
		}
		// increment counter to keep names unique
		inc++;

	};

	// changes color of model depending on if from personal or database
	$scope.styleModel = function(dbType) {
	if(dbType == "Personal")		
		return {
				'color': '#FFFFFF',
				'background-color': '#00568C'
		};
	else if(dbType == "Database")
		return {
				'color': '#FFFFFF',
				'background-color': '#5d6b74'
		};
	};
}

//scope for the cellgroups in the center menu
function myModelsList2($scope, $compile) {
	// show the first layer of cellgroups added
	$scope.list = globalCellGroup;
	
	// set the midMenuLast model to the last cellgroup the user clicks on in the middle menu
	$scope.setModel = function (model){
		// if user on home state
		if(pos == 0) {
			// search the array for the model the user clicked on
			var result = $.grep(globalCellGroup, function(e){ return e.name == model; });

			// clone the value in midMenuLast
			midMenuLast = clone(result[0]);

			// find the index of that value
			index1 = getIndex(globalCellGroup, "name", midMenuLast.name);

			// populate the cellgroup parameters on the right corresponding to what the user clicked on
			popCellP();
			return;
		}

		var moveInto = globalCellGroup[indexs[0]];
			for(i=1; i<pos; i++) {
				if(moveInto.subGroup.length != 0 ) {
					moveInto = moveInto.subGroup[indexs[i]];
				} 
			}

		// search the subArray and find the name and then the index of that name
		var result = $.grep(moveInto.subGroup, function(e){ return e.name == model; });
		midMenuLast = clone(result[0]);
		index1 = getIndex(moveInto.subGroup, "name", midMenuLast.name);
		
		// populate the cellgroup parameters on the right corresponding to what the user clicked on
		popCellP();
	};
	
	// when the user double clicks on a cellgroup it should set the scope to that cellgroups subgroup.
	$scope.intoModel = function (){
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

$().ready( function() {
    $('#modelP').click(popModelP);
    $('#cellP').click(popCellP);
    $('#p1').hide();
    $('#p2').hide();
    $('#p3').hide();
    $('#p4').hide();
    $.fn.editable.defaults.mode = 'popup';
});

function popCellP() {
    $('#p2').hide();
    $('#p3').hide();
    $('#p4').hide();
    $('#p1').show();
    $('#paramval').html('');
	$("#paramval").append('<a id="n1" class="list-group-item">' + midMenuLast.name +'</a>');
	$("#paramval").append('<a id="n2" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
	$("#paramval").append('<a id="n3" class="list-group-item">' + midMenuLast.num +'</a>');
	$("#paramval").append('<a id="n4" class="list-group-item">' + midMenuLast.geometry +'</a>');
	$('#paramval a').editable({
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
			            if(pos == 0) { globalCellGroup[index0] = clone(midMenuLast); }
			            else { moveInto3.subGroup[index] = clone(midMenuLast); }
		            }
	});
}

function popModelP() {
	showParameterNames();
	var dropChoice = [{'value': 0, 'text': 'exact'}, {'value': 1, 'text': 'uniform'}, {'value': 2, 'text': 'normal'}];

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
			        }
	});
	$('#type2 a').editable({
		'source': dropChoice,
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
				        if(this.id == "a1") { swap.a.type = dropChoice[newValue].text; }
				        if(this.id == "b1") { swap.b.type = dropChoice[newValue].text; }
				        if(this.id == "c1") { swap.c.type = dropChoice[newValue].text; }
				        if(this.id == "d1") { swap.d.type = dropChoice[newValue].text; }
				        if(this.id == "u1") { swap.u.type = dropChoice[newValue].text; }
				        if(this.id == "v1") { swap.v.type = dropChoice[newValue].text; }
				        if(this.id == "t1") { swap.threshold.type = dropChoice[newValue].text; }
                        if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
				        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
			        }
	});
	$('#value a').editable({
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
				        if(this.id == "a2") { swap.a.value = newValue; }
				        if(this.id == "b2") { swap.b.value = newValue; }
				        if(this.id == "c2") { swap.c.value = newValue; }
				        if(this.id == "d2") { swap.d.value = newValue; }
				        if(this.id == "u2") { swap.u.value = newValue; }
				        if(this.id == "v2") { swap.v.value = newValue; }
				        if(this.id == "t2") { swap.value = newValue; }
			            if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
				        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
			        }
	});
	$('#minvalue a').editable({
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
				        if(this.id == "a3") { swap.a.minValue = newValue; }
				        if(this.id == "b3") { swap.b.minValue = newValue; }
				        if(this.id == "c3") { swap.c.minValue = newValue; }
				        if(this.id == "d3") { swap.d.minValue = newValue; }
				        if(this.id == "u3") { swap.u.minValue = newValue; }
				        if(this.id == "v3") { swap.v.minValue = newValue; }
				        if(this.id == "t3") { swap.minValue = newValue; }
			            if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
				        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
			        }
	});
	$('#maxvalue a').editable({
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
				        if(this.id == "a4") { swap.a.maxValue = newValue; }
				        if(this.id == "b4") { swap.b.maxValue = newValue; }
				        if(this.id == "c4") { swap.c.maxValue = newValue; }
				        if(this.id == "d4") { swap.d.maxValue = newValue; }
				        if(this.id == "u4") { swap.u.maxValue = newValue; }
				        if(this.id == "v4") { swap.v.maxValue = newValue; }
				        if(this.id == "t4") { swap.maxValue = newValue; }
			            if(pos == 0) { globalCellGroup[index0].modelParameters.parameters = $.extend(true, {}, swap); }
				        else { moveInto3.subGroup[index].modelParameters.parameters = $.extend(true, {}, swap); }
			        }
	});
}




function showParameterNames() {
	if(midMenuLast.modelParameters.type === "Izhikevich") {
		$('#p1').hide();
        $('#p3').hide();
        $('#p4').hide();
		$('#p2').show();
		$('#paramval').html('');
		$('#paramval').append('<div id="name"></div>');
		$('#paramval').append('<div id="type1"></div>');
		$('#paramval').append('<div class="row">');
		$('#paramval').append('<div id="type2" class="col-lg-3"></div>');
		$('#paramval').append('<div id="value" class="col-lg-3"></div>');
		$('#paramval').append('<div id="minvalue" class="col-lg-3"></div>');
		$('#paramval').append('<div id="maxvalue" class="col-lg-3"></div>');
		$('#paramval').append('</div>');
		

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
    	$('#p1').hide();
        $('#p3').show();
        $('#p4').hide();
		$('#p2').hide();
		$('#paramval').html('');
		$('#paramval').append('<div id="name"></div>');
		$('#paramval').append('<div id="type1"></div>');
		$('#paramval').append('<div class="row">');
		$('#paramval').append('<div id="type2" class="col-lg-3"></div>');
		$('#paramval').append('<div id="value" class="col-lg-3"></div>');
		$('#paramval').append('<div id="minvalue" class="col-lg-3"></div>');
		$('#paramval').append('<div id="maxvalue" class="col-lg-3"></div>');
		$('#paramval').append('</div>');
		

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

		$("#type2").append('<a id="d1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calcium.type +'</a>');
		$("#value").append('<a id="d2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.value +'</a>');
		$("#minvalue").append('<a id="d3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.minValue +'</a>');
		$("#maxvalue").append('<a id="d4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calcium.maxValue +'</a>');

		$("#type2").append('<a id="u1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.type +'</a>');
		$("#value").append('<a id="u2" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.value +'</a>');
		$("#minvalue").append('<a id="u3" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.minValue +'</a>');
		$("#maxvalue").append('<a id="u4" class="list-group-item">' + midMenuLast.modelParameters.parameters.calciumSpikeIncrement.maxValue +'</a>');

		$("#type2").append('<a id="v1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauCalcium.type +'</a>');
		$("#value").append('<a id="v2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.value +'</a>');
		$("#minvalue").append('<a id="v3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.minValue +'</a>');
		$("#maxvalue").append('<a id="v4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauCalcium.maxValue +'</a>');

		$("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.leakReversalPotential.type +'</a>');
		$("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.value +'</a>');
		$("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.minValue +'</a>');
		$("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.leakReversalPotential.maxValue +'</a>');

		$("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.tauMembrane.type +'</a>');
		$("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.value +'</a>');
		$("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.minValue +'</a>');
		$("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.tauMembrane.maxValue +'</a>');

		$("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.rMembrane.type +'</a>');
		$("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.value +'</a>');
		$("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.minValue +'</a>');
		$("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.rMembrane.maxValue +'</a>');

		$("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.spikeShape.type +'</a>');
		$("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.value +'</a>');
		$("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.minValue +'</a>');
		$("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.spikeShape.maxValue +'</a>');

		$("#type2").append('<a id="t1" class="list-group-item" data-type="select">' + midMenuLast.modelParameters.parameters.channel +'</a>');
		$("#value").append('<a id="t2" class="list-group-item">' + midMenuLast.modelParameters.parameters.channel +'</a>');
		$("#minvalue").append('<a id="t3" class="list-group-item">' + midMenuLast.modelParameters.parameters.channel +'</a>');
		$("#maxvalue").append('<a id="t4" class="list-group-item">' + midMenuLast.modelParameters.parameters.channel +'</a>');
	}

}

function clone(source) {
	var clone = {};
	for( var key in source) {
		if(source.hasOwnProperty(key)) {
			clone[key] = source[key];
		}
	}
	return clone;	
}

function getIndex(source, attr, value) {
	for(var i=0; i<source.length; i++) {
		if(source[i][attr] === value) {
			return i;
		}
	}
}
