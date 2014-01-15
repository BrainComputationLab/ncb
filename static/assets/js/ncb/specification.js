
function ModelParameters(name, type, map)
{
	this.name = name;
	this.type = type;
	this.map = map || {};
}

ModelParameters.prototype.toJSON = function() {
	return {"name" : this.name, "type" : this.type, "map" : this.map};
}

function CellGroup(name, numberOfCells, modelParameters, geoGen)
{
	this.name = name;
	this.count = numberOfCells;
	this.parameters = modelParameters;
	this.geoGen = geoGen || {};
}

CellGroup.prototype.toJSON = function() {
	return {"name" : this.name, "count" : this.count, "parameters" : this.parameters.toJSON(), "geometry" : this.geoGen};
}

function CellAlias()
{
	this.cellGroups = [];
	for(var i = 0; i < arguments.length; i++)
		this.cellGroups[i] = arguments[i];
}

CellAlias.prototype.toJSON = function() {
	var obj = {"CellGroups" : []};

	for(var i = 0; i < this.cellGroups.length; i++)
		obj.CellGroups[i] = this.cellGroups[i].toJSON();

	return obj;
}

function ConnectionGroup(name, presynaptic, postsynaptic, probability, modelParameters)
{
	this.name = name;
	this.presynaptic = presynaptic;
	this.postsynaptic = postsynaptic;
	this.probability = probability;
	this.parameters = modelParameters;
}

ConnectionGroup.prototype.toJSON = function() {
	return {
		"name" : this.name, 
		"presynaptic" : this.presynaptic.toJSON(),
		"postsynaptic" : this.postsynaptic.toJSON(),
		"probability" : this.probability,
		"ModelParameters" : this.parameters.toJSON()
	};
}

function sendJSON(jsonObj) {
    var request = $.ajax({
		url: '/json',
		type: 'POST',

		data: JSON.stringify(jsonObj.toJSON()),
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	});

	request.done(function(response, textStatus, jqXHR) {
		console.log("JSON Successfully Uploaded");
	});
}

function getJSON() {
	var jsonObj = $.getJSON("json", {}, function(data,textStatus,jqXHR) {
		console.log("JSON Successfully Received");
	});

	return jsonObj;
}

// testing area
$().ready(function() {
    var x = new CellGroup("CellGroup1", 2000, new ModelParameters("param1", "izhikevich"));
    var alias = new CellAlias(x,x,x);
    var conn = new ConnectionGroup("name1", alias, alias, 0.65, new ModelParameters("param2", "LIF"));
    
    sendJSON(conn);
    var recData = getJSON();
    console.log(recData);
});