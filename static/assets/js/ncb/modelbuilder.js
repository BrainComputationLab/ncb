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

function cellGroup(name, num, model, geometry) {
	this.name = name;
	this.num = num;
	this.model = model;
	this.geometry = geometry;
}

function connectionGroup(pre, post, prob, model) {

}

function inputGroup() {

}

function container(cellGroup) {
	this.cellGroup = cellGroup;
}

function lastActive(cont, id) {
	this.cont = cont;
	this.id = id;
}

var myModels = [
	new model('Model1', 'Izhikevich'),
	new model('Model2', 'ncs'),
	new model('Model3', 'Rectangular_Current'),
	new model('Model4', 'Flat'),
	new model('Model5', 'Izhikevich'),
	new model('Model6', 'Izhikevich'),
	new model('Model7', 'Flat'),
	new model('Model8', 'ncs'),
	new model('Model9', 'Rectangular_Current'),
	new model('Model10', 'Izhikevich'),
];

var inc = 0;
var myModels2 = [];
var cellGroupVal = [];
var lastActive;
var lastActive2;


function myModelsList($scope) {
	$scope.currentModel = null;
	$scope.list = myModels;

	$scope.setModel = function (model){
		var result = $.grep(myModels, function(e){ return e.name == model; });
		lastActive = result[0];
	};

	$scope.moveModel = function (model) {
		var result = $.grep(myModels, function(e){ return e.name == model; });
		cellGroupVal.push({name: "tempGrp"+inc, num: 1, model: result[0], geometry: "box"});
		inc++;
	};
}

function myModelsList2($scope) {
	$scope.currentModel = null;
	$scope.list = cellGroupVal;

	$scope.setModel = function (model){
		var result = $.grep(cellGroupVal, function(e){ return e.name == model; });
		lastActive2 = result[0];
		popCellP();		
	};
}


$().ready( function() {
    //$('#addFromDatabaseBody a').click(setActiveDatabase);
    $('#modelP').click(popModelP);
	$('#cellP').click(popCellP);
    $('#p1').hide();
    $('#p2').hide();
  	$.fn.editable.defaults.mode = 'popup';
	$('#modelList a').draggable({helper:"clone", appendTo:"body"});
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
	$("#paramval").append('<a class="list-group-item">' + lastActive2.name +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.name +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.num +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.geometry +'</a>');
	$('#paramval a').editable();
}

function popModelP() {
	$('#p1').hide();
	$('#p2').show();
	$('#paramval').html('');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.name +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.type +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.a+'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.b +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.c +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.d +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.u +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.v +'</a>');
	$("#paramval").append('<a class="list-group-item">' + lastActive2.model.threshold +'</a>');
	$('#paramval a').editable();
}

/*
var bootstrap = angular.module("bootstrap", []);

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
*/
/*
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
*/


/*
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

function popModelP() {
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

