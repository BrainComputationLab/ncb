var simProgressBar = $("#uploadSimProgress");
//var objectFromUpload;
// initialize import modal on show event
$("#simbuilder_importparams").on("show.bs.modal", function() {
    // set progress bar to 0% and hide it
    simProgressBar.attr("style", "width: 0%");
    simProgressBar.hide();

    // enable modal control buttons
    $(".importButtons").prop("disabled", false);
    
    // hide possible error message
    $("#possibleSimError").hide();

    // reset file input field
    clearFileInput("#uploadSimulationFile");
});

// update file information on change event
$("#uploadSimulationFile").change(function() {
    var file = this.files[0];
    fileName = file.name;
    fileSize = file.size;
    fileType = file.type;

    // check for invalid file extensions
    if(fileName.indexOf(".json") === -1 && fileName.indexOf(".py") === -1) {
        // show error if incorrect file type
        $("#possibleSimError").show();
        // disable Ok button
        $("#importSimOkButton").prop("disabled", true);
    }

    // else correct file type
    else {
        // hide possible error message
        $("#possibleSimError").hide();
        // enable Ok button
        $("#importSimOkButton").prop("disabled", false);
    }
});

// variables for upload status
var request, finished;

// upload file on submit event
$("#uploadSimulationForm").submit(function(event) {
    finished = false;
    // get the form data
    var formData = new FormData($(this)[0]);

    // function for determining upload percent
    var uploadProgress = function(e) {
        if(e.lengthComputable) {
            var percentage = (e.loaded / e.totalSize) * 100;
            simProgressBar.attr("aria-valuenow", percentage);
            simProgressBar.attr("style", "width: " + percentage + "%");
        }
    };

    // initiate request
    request = $.ajax({
        // route to call
        url: "/uploadsim",
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
        objectFromUpload = getJSON("uploadsim");
        console.log(objectFromUpload);
        $("#simbuilder_importparams").modal("hide");
        simProgressBar.hide();
    });

    // function callback on failed upload
    request.fail(function(jqXHR, textStatus, error) {
        console.error("Error in upload!");
        alert("Unable to upload file: " + error);
        simProgressBar.hide();
        $(".importButtons").prop("disabled", false);

    });

    // function callback to be called regardless of success or failure
    request.always(function() {
    });

    // prevent the default action for this event
    event.preventDefault();
});

//function SimulationController($scope, $routeParams) {
var createNewSim = function() {
    console.log("New params Selected!");
};

// function for initiating a params import
var importSim = function() {
    console.log("In SIm!!!");
    var value = $("#uploadSimulationFile").val();

    // if file selected, trigger an upload
    if(value) {
        progressBar.show();
        $("#uploadSimulationForm").trigger("submit");
        $(".importButtons").prop("disabled", true);
    }

    // otherwise import from database
    else {
        $("#simbuilder_importparams").modal("hide");
    }
};	

$("#exportSimFileName").on('input', function() {
    fileName = $("#exportSimFileName").val();
    
    if(fileName === '' || fileName === undefined) {
        $("#exportSimOkButton").prop("disabled", true);
    }

    else {
        $("#exportSimOkButton").prop("disabled", false);
    }
});

$("#simbuilder_export").on("show.bs.modal", function() {
    $("#exportSimFileName").val('');
    $("#exportSimOkButton").prop("disabled", true);
});

var exportSim = function() {
    $.ajax({
        url: "/uploads/params.json",
        type: "GET"
    });
};
//}