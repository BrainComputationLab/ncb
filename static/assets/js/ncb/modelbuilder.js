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
	new model('Model1'),
	new model('Model2'),
	new model('Model3'),
	new model('Model4'),
	new model('Model5'),
	new model('Model6'),
	new model('Model7'),
	new model('Model8'),
	new model('Model9'),
	new model('Model10'),
	new model('Model11'),
	new model('Model12'),
	new model('Model13'),
	new model('Model14'),
	new model('Model15'),
	new model('Model16'),
	new model('Model17'),
	new model('Model18'),
];

var myModels2 = [
	new model('Modelx'),
	new model('Modely'),
	new model('Modelz'),
	new model('Modelw'),

];

var container1 = new Array();
var container2 = new Array();
var lastActive;
var selectedValue = 1;

function myModelsList($scope) {
  $scope.list = myModels;
}

$().ready( function() {
    $('#addFromDatabaseBody a').click(setActiveDatabase);
    $('#modelP').click(popModelP);
	$('#cellP').click(showValues);
    $('#p1').hide();
    $('#p2').hide();

  $.fn.editable.defaults.mode = 'popup';

  populateModels();
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

function populateContainers() {
	$('#collapse1').html('');
		for(var i=0; i<container1.length; i++) {
			$("#collapse1").append('<a id="' + i + '" href="#" class="list-group-item">' + container1[i].cellGroup.name + '</a>');
				$("#collapse1").on("click", "a:not(.active)", function ( event ) {
		  		$(".active", event.delegateTarget).removeClass("active");
		 			$(this).addClass("active");
					lastActive.id = $(this).attr('id');
					lastActive.cont = 0;
		 			showValues();
				});
		}
	$('#collapse2').html('');
		for(var i=0; i<container2.length; i++) {
			$("#collapse2").append('<a id="' + i + '" href="#" class="list-group-item">' + container2[i].cellGroup.name + '</a>');
				$("#collapse2").on("click", "a:not(.active)", function ( event ) {
		  		$(".active", event.delegateTarget).removeClass("active");
		 			$(this).addClass("active");
					lastActive.id = $(this).attr('id');
					lastActive.cont = 1;
		 			showValues();
				});
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

$().ready(function() {
	$( "#modelList a" ).draggable({
		helper: "clone"
	});

	$( "#modelList2 a" ).droppable({
		hoverClass: "highlight",
		drop: function( event, ui ) {
			if(selectedValue == 1) {
				var tempGrp = new cellGroup("tmpname", 1, myModels[ui.draggable.attr('id')], "box");
				if($(this).attr('id') == "c1") {
					container1.push({cellGroup: tempGrp});
				}
				else {
					container2.push({cellGroup: tempGrp});
				}
				populateContainers();
			}
			else if(selectedValue == 2) {
				var tempGrp = new cellGroup("tmpname", 1, myModels2[ui.draggable.attr('id')], "box");
				if($(this).attr('id') == "c1") {
					container1.push({cellGroup: tempGrp});
				}
				else {
					container2.push({cellGroup: tempGrp});
				}
				populateContainers();
			}
		}
	});
});

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


