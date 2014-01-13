//test models
var testParam = new izhikevichParam();
var myModels = [
	new modelParameters('Model1', 'Izhikevich', testParam),
	new modelParameters('Model2', 'Izhikevich', testParam),
	new modelParameters('Model3', 'Izhikevich', testParam),
	new modelParameters('Model4', 'Izhikevich', testParam),
	new modelParameters('Model5', 'Izhikevich', testParam),
];

// variables needed for implementation
var inc = 0;
var pos = 0;
var value = 0;
var index1 = 0;
var indexs = [];
var breadDepth = 1;
var globalCellGroup = [];

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
  	$.fn.editable.defaults.mode = 'popup';
});

function popCellP() {
	$('#p2').hide();
	$('#p1').show();
	$('#paramval').html('');
	$("#paramval").append('<a id="n1" class="list-group-item">' + midMenuLast.name +'</a>');
	$("#paramval").append('<a id="n2" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
	$("#paramval").append('<a id="n3" class="list-group-item">' + midMenuLast.num +'</a>');
	$("#paramval").append('<a id="n4" class="list-group-item">' + midMenuLast.geometry +'</a>');
	$('#paramval a').editable({
		success: function(response, newValue) {
			var moveInto3 = globalCellGroup[0];
			for(i=1; i<pos; i++) {
				if(moveInto3.subGroup.length != 0 ) {
					moveInto3 = moveInto3.subGroup[indexs[i]];
				} 
			}

			// search the subArray and find the name and then the index of that name
			var result0 = $.grep(globalCellGroup, function(e){ return e.name == midMenuLast.name; });			
			var newVal0 = clone(result0[0]);
			var index0 = getIndex(globalCellGroup, "name", midMenuLast.name);

			var result = $.grep(moveInto3.subGroup, function(e){ return e.name == midMenuLast.name; });
			var newVal = clone(result[0]);
			var index = getIndex(moveInto3.subGroup, "name", midMenuLast.name);

			if(this.id == "n1") {
				midMenuLast.name = newValue;
			}
			if(this.id == "n2") {
				midMenuLast.modelParameters.name = newValue;
			}
			if(this.id == "n3") {
				midMenuLast.num = newValue;
			}
			if(this.id == "n4") {
				midMenuLast.geometry = newValue;
			}
			if(pos == 0) {
				console.log(midMenuLast.name);
				globalCellGroup[index0] = clone(midMenuLast);
				console.log(midMenuLast.name);
			}
			else {
				moveInto3.subGroup[index] = clone(midMenuLast);
			}
		}
	});
}

function popModelP() {
	showParameterNames()
	$('#paramval a').editable({
		success: function(response, newValue) {
			var index = getIndex(globalCellGroup, "name", midMenuLast.modelParameters.name);

			if(this.id == "n11") {
				midMenuLast.modelParameters.name = newValue;
			}
			if(this.id == "n22") {
				midMenuLast.modelParameters.type = newValue;
			}
			if(this.id == "n33") {
				midMenuLast.modelParameters.parameters.a.value = newValue;
			}
			if(this.id == "n44") {
				midMenuLast.modelParameters.parameters.b.value = newValue;
			}
			if(this.id == "n55") {
				midMenuLast.modelParameters.parameters.c.value = newValue;
			}
			if(this.id == "n66") {
				midMenuLast.modelParameters.parameters.d.value = newValue;
			}
			if(this.id == "n77") {
				midMenuLast.modelParameters.parameters.u.value = newValue;
			}
			if(this.id == "n88") {
				midMenuLast.modelParameters.parameters.v.value = newValue;
			}
			if(this.id == "n99") {
				midMenuLast.modelParameters.parameters.threshold = newValue;
			}
			if(pos == 0) {
				globalCellGroup[index] = clone(midMenuLast);
			}
			else {
				globalCellGroup[index1].subGroup[index] = clone(midMenuLast);
			}
		}
	});
}

function showParameterNames() {
	if(midMenuLast.modelParameters.type === "Izhikevich") {
		$('#p1').hide();
		$('#p2').show();
		$('#paramval').html('');
		$("#paramval").append('<a id="n11" class="list-group-item">' + midMenuLast.modelParameters.name +'</a>');
		$("#paramval").append('<a id="n22" class="list-group-item">' + midMenuLast.modelParameters.type +'</a>');
		$("#paramval").append('<a id="n33" class="list-group-item">' + midMenuLast.modelParameters.parameters.a.value +'</a>');
		$("#paramval").append('<a id="n44" class="list-group-item">' + midMenuLast.modelParameters.parameters.b.value +'</a>');
		$("#paramval").append('<a id="n55" class="list-group-item">' + midMenuLast.modelParameters.parameters.c.value +'</a>');
		$("#paramval").append('<a id="n66" class="list-group-item">' + midMenuLast.modelParameters.parameters.d.value +'</a>');
		$("#paramval").append('<a id="n77" class="list-group-item">' + midMenuLast.modelParameters.parameters.u.value +'</a>');
		$("#paramval").append('<a id="n88" class="list-group-item">' + midMenuLast.modelParameters.parameters.v.value +'</a>');
		$("#paramval").append('<a id="n99" class="list-group-item">' + midMenuLast.modelParameters.parameters.threshold.value +'</a>');
	}
	else {
		$('#p1').hide();
		$('#p2').hide();
		$('#paramval').html('');
		$("#paramval").append('<a id="n11" class="list-group-item">Currently only izhikevich cells show</a>');
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

