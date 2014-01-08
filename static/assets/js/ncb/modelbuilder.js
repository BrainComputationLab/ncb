// class representing an izhikevich model
function model(name, type, a, b, c, d, u, v, threshold, paramNames) {
	this.name = name;
	this.type = type;//izhikevich, ncs, rectangular_current, flat, etc.
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.u = u;
	this.v = v;
	this.threshold = threshold;
}

// class representing a cell group
function cellGroup(name, num, model, geometry, subGroup) {
	this.name = name;
	this.num = num;
	this.model = model;
	this.geometry = geometry;
	this.subGroup = subGroup;
}

// class representing a connection group
function connectionGroup(pre, post, prob, model) {
	this.pre = pre;
	this.post = post;
	this.prob = prob;
	this.model = model;
}

// class representing an input group
function inputGroup() {

}

// class representing a container object
function container(cellGroup) {
	this.cellGroup = cellGroup;
}

// class representing the last active object
function lastActive(cont, id) {
	this.cont = cont;
	this.id = id;
}

// list of example models
// temporary for testing
var myModels = [
	new model('Model1', //name
			  'Izhikevich', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model2', //name
			  'ncs', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model3', //name
			  'rectangular_current', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model4', //name
			  'Flat', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model5', //name
			  'Izhikevich', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model6', //name
			  'Izhikevich', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model7', //name
			  'Flat', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model8', //name
			  'ncs', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model9', //name
			  'rectangular_current', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
	new model('Model10', //name
			  'Izhikevich', //type
			  2.5, //a
			  1.9, //b
			  0.3, //c
			  2.6, //d
			  10.0, //u
			  1.5, //v
			  0.5), //threshold
];

// variables needed for implementation
var inc = 0;
var myModels2 = [];
var cellGroupVal = [];
var lastActive = new model();
var lastActive2 = new cellGroup();
var lastActive3;
var test = 0;
var pos = 0;
var value = 0;
var index1 = 0;
var temp = new model();

//scope for models in the left menu
function myModelsList($scope) {
	//set the scope to point at myModels
	$scope.list = myModels;

	//sets the lastActive model to the last model the user clicks on
	$scope.setModel = function (model){
		var result = $.grep(myModels, function(e){ return e.name == model; });
		lastActive = clone(result[0]);
	};

	//when the user dblclicks or drags the model from the left menu to the right menu, it pushes the model into the cellgroup variable which represents the center menu.
	$scope.moveModel = function (model) {
		var result = $.grep(myModels, function(e){ return e.name == model; });
		var sub = [];

		// push a new cellgroup into the cellGroup variable
		if(pos == 0) {
			cellGroupVal.push({name: "tempGrp"+inc, num: 1, model: clone(result[0]), geometry: "box", subGroup: sub});

		}
		else {
			cellGroupVal[index1].subGroup.push({name: "tempGrp"+inc, num: 1, model: clone(result[0]), geometry: "box", subGroup: sub});
		}

		console.log(cellGroupVal.length);

		//cellGroupVal[0].subGroup.push({name: "test1", num: 1, model: clone(result[0]), geometry: "box", subGroup: []}); // testing nesting subgroups in the main cellgroup variable. This part works.

		// increment the counter to make each cellgroup name unique.
		inc++;
	};
}

//scope for the cellgroups in the center menu
function myModelsList2($scope) {
	// if the value is 0 then set the scope to present the original cellgroups at the start of the list.
	if(test == 0) {
		$scope.list = cellGroupVal;
	}

	angular.element($('#b1')).scope().$apply();

	// set the lastActive2 model to the last cellgroup the user clicks on in the middle menu
	$scope.setModel = function (model){
		if(pos == 0) {
			var result = $.grep(cellGroupVal, function(e){ return e.name == model; });
			lastActive2 = clone(result[0]);
			index1 = getIndex(cellGroupVal, "name", lastActive2.name);
			popCellP();
		}
		else {
			var result = $.grep(cellGroupVal[index1].subGroup, function(e){ return e.name == model; });
			lastActive2 = clone(result[0]);
			popCellP();	
		}
	};
	
	// when the user double clicks on a cellgroup it should set the scope to that cellgroups subgroup.
	$scope.intoModel = function (){
		test = 1;
		pos += 1;

		$("#bread").append('<li><a id="bc2" href="#">' + lastActive2.name + '</a></li>');

		if(test == 1) {
			$scope.list = cellGroupVal[index1].subGroup; 
		}
	};

	$scope.breadGoHome = function () {
		test = 0;
		pos = 0;

		if(test == 0) {
			$scope.list = cellGroupVal;
			console.log($scope.list.name);
		}
		//console.log(cellGroupVal[0].name);
	};
}


$().ready( function() {
    //$('#addFromDatabaseBody a').click(setActiveDatabase);
    $('#modelP').click(popModelP);
	$('#cellP').click(popCellP);
    $('#p1').hide();
    $('#p2').hide();
  	$.fn.editable.defaults.mode = 'popup';
	$('#modelList a').draggable({
		helper: "clone",
		appendTo: "body"
	});
});

$().ready(function() {
	$( "#modelList2" ).droppable({
		hoverClass: "highlight",
		drop: function( event, ui ) {
			cellGroupVal.push({name: "tempGrp"+inc, num: 1, model: lastActive, geometry: "box"});
			inc++;
		}
	});
});

function popCellP() {
	$('#p2').hide();
	$('#p1').show();
	$('#paramval').html('');
	$("#paramval").append('<a id="n1" class="list-group-item">' + lastActive2.name +'</a>');
	$("#paramval").append('<a id="n2" class="list-group-item">' + lastActive2.model.name +'</a>');
	$("#paramval").append('<a id="n3" class="list-group-item">' + lastActive2.num +'</a>');
	$("#paramval").append('<a id="n4" class="list-group-item">' + lastActive2.geometry +'</a>');
	$('#paramval a').editable({
		success: function(response, newValue) {
			var index = getIndex(cellGroupVal, "name", lastActive2.name);

			if(this.id == "n1") {
				lastActive2.name = newValue;
			}
			if(this.id == "n2") {
				lastActive2.model.name = newValue;
			}
			if(this.id == "n3") {
				lastActive2.num = newValue;
			}
			if(this.id == "n4") {
				lastActive2.geometry = newValue;
			}
			if(pos == 0) {
				cellGroupVal[index] = clone(lastActive2);
			}
			else {
				cellGroupVal[index1].subGroup[index] = clone(lastActive2);
			}
		}
	});
}

function popModelP() {
	$('#p1').hide();
	$('#p2').show();
	$('#paramval').html('');
	$("#paramval").append('<a id="n11" class="list-group-item">' + lastActive2.model.name +'</a>');
	$("#paramval").append('<a id="n22" class="list-group-item">' + lastActive2.model.type +'</a>');
	$("#paramval").append('<a id="n33" class="list-group-item">' + lastActive2.model.a+'</a>');
	$("#paramval").append('<a id="n44" class="list-group-item">' + lastActive2.model.b +'</a>');
	$("#paramval").append('<a id="n55" class="list-group-item">' + lastActive2.model.c +'</a>');
	$("#paramval").append('<a id="n66" class="list-group-item">' + lastActive2.model.d +'</a>');
	$("#paramval").append('<a id="n77" class="list-group-item">' + lastActive2.model.u +'</a>');
	$("#paramval").append('<a id="n88" class="list-group-item">' + lastActive2.model.v +'</a>');
	$("#paramval").append('<a id="n99" class="list-group-item">' + lastActive2.model.threshold +'</a>');
	$('#paramval a').editable({
		success: function(response, newValue) {
			var index = getIndex(cellGroupVal, "name", lastActive2.model.name);

			if(this.id == "n11") {
				lastActive2.model.name = newValue;
			}
			if(this.id == "n22") {
				lastActive2.model.type = newValue;
			}
			if(this.id == "n33") {
				lastActive2.model.a = newValue;
			}
			if(this.id == "n44") {
				lastActive2.model.b = newValue;
			}
			if(this.id == "n55") {
				lastActive2.model.c = newValue;
			}
			if(this.id == "n66") {
				lastActive2.model.d = newValue;
			}
			if(this.id == "n77") {
				lastActive2.model.u = newValue;
			}
			if(this.id == "n88") {
				lastActive2.model.v = newValue;
			}
			if(this.id == "n99") {
				lastActive2.model.threshold = newValue;
			}
			if(pos == 0) {
				cellGroupVal[index] = clone(lastActive2);
			}
			else {
				cellGroupVal[index1].subGroup[index] = clone(lastActive2);
			}
		}
	});
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

var bootstrap = angular.module("bootstrap", []);


/*
bootstrap.directive('popOver', function ($compile) {
        var itemsTemplate = "<ul class='unstyled'><li ng-repeat='model in list'>{{ '{{item}}' }}</li></ul>";
        var getTemplate = function (contentType) {
            var template = '';
            switch (contentType) {
                case 'list':
                    template = itemsTemplate;
                    break;
            }
            return template;
        }
        return {
            restrict: "A",
            transclude: true,
            template: "<span ng-transclude></span>",
            link: function (scope, element, attrs) {
                var popOverContent;
                if (scope.list) {
                    var html = getTemplate("list");
                    popOverContent = $compile(html)(scope);                    
                }
                var options = {
                    content: popOverContent,
                    placement: "right",
                    html: true,
                    title: scope.title
                };
                $(element).popover(options);
            },
            scope: {
                list: '=',
                title: '@'
            }
        };
    });


function populateModels() {
	$('#modelList').html('');
	if(selectedValue == 1) {
		for(var i=0; i<myModels.length; i++) {
			$("#modelList").append('<a id="' + i + '" href="#" class="draggable list-group-item">' + myModels[i].name + '</a>').find('a.draggable').draggable({helper:"clone"});
				$("#modelList").on("mousedown", "a:not(.active)", function ( event ) {
		  		$(".active", event.delegateTarget).removeClass("active");
		 			$(this).addClass("active");
				});
		}
  }
	if(selectedValue == 2) {
		for(var i=0; i<myModels2.length; i++) {
			$("#modelList").append('<a id="' + i + '" href="#" class="draggable list-group-item">' + myModels2[i].name + '</a>').find('a.draggable').draggable({helper:"clone"});
				$("#modelList").on("mousedown", "a:not(.active)", function ( event ) {
		  		$(".active", event.delegateTarget).removeClass("active");
		 			$(this).addClass("active");
				});
		}
  }
}


function setActiveDatabase() {
	clearDatabaseItems();
	selectedValue = this.id;
	$(this).addClass("active");
}

function clearDatabaseItems() {
	$("#addFromDatabaseBody a").removeClass("active");
}


function showValues() {
	$('#p1').show();
    $('#p2').hide();
	$('#paramval').html('');
	num = lastActive.id;
	if(lastActive.cont == 0) {
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.num +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.geometry +'</a>');
	}
	if(lastActive.cont == 1) {
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.num +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.geometry +'</a>');
	}
	$('#paramval a').editable({
		type: 'text',
		validate : function(value) {
			if(isNaN(value)) {
				return "Number Required";
			}
		}
	});
}

function popModelP2() {
	$('#p1').hide();
    $('#p2').show();
	$('#paramval').html('');
	num = lastActive.id;
	if(lastActive.cont == 0) {
		$("#paramval").append('<a href="#" class="list-group-item">' + container1[num].cellGroup.model.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.type +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.a +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.b +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.c +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.d +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.u +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.v +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container1[num].cellGroup.model.threshold +'</a>');
	}
	if(lastActive.cont == 1) {
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.name +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.type +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.a +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.b +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.c +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.d +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.u +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.v +'</a>');
		$("#paramval").append('<a class="list-group-item">' + container2[num].cellGroup.model.threshold +'</a>');
	}
	$('#paramval a').editable();
}
*/

