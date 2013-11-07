var progressBar = $("#uploadProgress");

$("#modelbuilder_importmodel").on("show.bs.modal", function() {
	progressBar.attr("style", "width: 0%");
	progressBar.addClass("active");
	$(".importButtons").prop("disabled", false);
});

var fileName,
	fileSize,
	fileType;

$("#uploadModelFile").change(function() {
	var file = this.files[0];
	fileName = file.name;
	fileSize = file.size;
	fileType = file.type;
});

var request, finished;

$("#uploadModelForm").submit(function(event) {
	//console.log("uploading file");

	finished = false;
	var formData = new FormData($(this)[0]);

	var uploadProgress = function(e) {
		if(e.lengthComputable) {
			var percentage = (e.loaded / e.totalSize) * 100;
			progressBar.attr("aria-valuenow", percentage);
			progressBar.attr("style", "width: " + percentage + "%");
		}
	};

	request = $.ajax({
		url: "/uploads",
		type: "POST",
		xhr: function() {
			var myXhr = $.ajaxSettings.xhr();
			if(myXhr.upload) {
				myXhr.upload.addEventListener('progress', uploadProgress, false);
			}
			return myXhr;
		},

		data: formData,
		cache: false,
		contentType: false,
		processData: false
	});

	request.done(function(response, textStatus, jqXHR) {
		console.log("upload complete");
		$("#modelbuilder_importmodel").modal("hide");
		progressBar.removeClass("active");
	});

	request.fail(function(jqXHR, textStatus, error) {
		console.error("Error in upload!");
		alert("Unable to upload file!" + error);
		progressBar.removeClass("active");
	});

	request.always(function() {
		//inputs.prop("disabled", false);
	});

	event.preventDefault();
});

// This will be changed to be more specific to a particular task
function ModelBuilderController($scope, $routeParams) {
    $scope.createNewModel = function() {
    	console.log("New Model Selected!");
    };

    $scope.importModel = function() {
    	$("#uploadModelForm").trigger("submit");
    	$(".importButtons").prop("disabled", true);
    	//progressBar.removeClass("active");
    	//$("#modelbuilder_importmodel").modal("hide");
    };
}
