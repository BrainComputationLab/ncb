var request;

$("#uploadModelForm").submit(function(event) {
	//console.log("uploading file");

	var form = $(this);

	var inputs = form.find("input, select, button, textarea");
	inputs.prop("disabled", true);

	var formData = event.target.result;//form.serialize();

	console.log("Result: " + formData);
	request = $.ajax({
		url: "/uploads",
		type: "post",
		data: formData
	});

	request.done(function(response, textStatus, jqXHR) {
		console.log("upload complete");
	});

	request.fail(function(jqXHR, textStatus, error) {
		console.error("Error in upload!");
	});

	request.always(function() {
		inputs.prop("disabled", false);
	});

	event.preventDefault();
});

// This will be changed to be more specific to a particular task
function ModelBuilderController($scope, $routeParams) {
    $scope.createNewModel = function() {
    	console.log("New Model Selected!");
    };

    $scope.importModel = function() {
    	$("#uploadModelFile").trigger("submit");
    };
}
