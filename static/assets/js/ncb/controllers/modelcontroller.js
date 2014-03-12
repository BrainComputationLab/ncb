// lookup progress bar object once (for performance reasons)
var progressBar = $("#uploadProgress");
var objectFromUpload;
// initialize import modal on show event
$("#modelbuilder_importmodel").on("show.bs.modal", function() {
	// set progress bar to 0% and hide it
	progressBar.attr("style", "width: 0%");
	progressBar.hide();

	// enable modal control buttons
	$(".importButtons").prop("disabled", false);
	
	// hide possible error message
	$("#possibleError").hide();

	// reset file input field
	clearFileInput();
});

// variables for file upload
var fileName,
	fileSize,
	fileType;

// update file information on change event
$("#uploadModelFile").change(function() {
	var file = this.files[0];
	fileName = file.name;
	fileSize = file.size;
	fileType = file.type;

	// check for invalid file extensions
	if(fileName.indexOf(".json") === -1 && fileName.indexOf(".py") === -1) {
		// show error if incorrect file type
		$("#possibleError").show();
		// disable Ok button
		$("#importOkButton").prop("disabled", true);
	}

	// else correct file type
	else {
		// hide possible error message
		$("#possibleError").hide();
		// enable Ok button
		$("#importOkButton").prop("disabled", false);
	}
});

// variables for upload status
var request, finished;

// upload file on submit event
$("#uploadModelForm").submit(function(event) {
	finished = false;
	// get the form data
	var formData = new FormData($(this)[0]);

	// function for determining upload percent
	var uploadProgress = function(e) {
		if(e.lengthComputable) {
			var percentage = (e.loaded / e.totalSize) * 100;
			progressBar.attr("aria-valuenow", percentage);
			progressBar.attr("style", "width: " + percentage + "%");
		}
	};

	// initiate request
	request = $.ajax({
		// route to call
		url: "/uploads",
		// type of request
		type: "POST",

		// function for progress handling
		xhr: function() {
			var myXhr = $.ajaxSettings.xhr();
			if(myXhr.upload) {
				myXhr.upload.addEventListener('progress', uploadProgress, false);
			}
			return myXhr;
		},

		// data to send
		data: formData,

		// disable caching and uneeded functions
		cache: false,
		contentType: false,
		processData: false
	});

	// function callback on successful upload
	request.done(function(response, textStatus, jqXHR) {
		console.log("upload complete");
		objectFromUpload = getJSON();
		console.log(objectFromUpload);
		$("#modelbuilder_importmodel").modal("hide");
		progressBar.hide();
	});

	// function callback on failed upload
	request.fail(function(jqXHR, textStatus, error) {
		console.error("Error in upload!");
		alert("Unable to upload file: " + error);
		progressBar.hide();
		$(".importButtons").prop("disabled", false);

	});

	// function callback to be called regardless of success or failure
	request.always(function() {
	});

	// prevent the default action for this event
	event.preventDefault();
});

// function for clearing the input file field
function clearFileInput(fileID)
{
	fileID = fileID || "#uploadModelFile";
	var fileInput = $(fileID);
    fileInput.replaceWith(fileInput.clone(true));
}

// function acting as the Model Controller
function ModelBuilderController($scope, $routeParams) {
	// function to create a new model
    $scope.createNewModel = function() {
    	console.log("New Model Selected!");
    };

    // function for initiating a model import
    $scope.importModel = function() {
    	var value = $("#uploadModelFile").val();

    	// if file selected, trigger an upload
    	if(value) {
			progressBar.show();
			$("#uploadModelForm").trigger("submit");
			$(".importButtons").prop("disabled", true);
		}

		// otherwise import from database
		else {
    		$("#modelbuilder_importmodel").modal("hide");
    	}
    };
}
