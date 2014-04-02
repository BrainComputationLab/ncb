var simProgressBar = $("#uploadSimProgress");
var simOutput = [];

$().ready(function() {
    $(".simOutputFileOnly").hide();

    $("#simOutputType").change(function() {
        if($("#simOutputType").val() === "file") {
            $(".simOutputFileOnly").show();
        }

        else {
            $(".simOutputFileOnly").hide();
        }
    });

    $("#stopSimButton").hide();
    //$("#launchSimButton").prop("disabled", true);
    $("#launchSimButton").on("confirmDialog", function() {
        $("#launchSimButton").hide();
        $("#stopSimButton").show();
    });

    $("#launchSimButton").click(function() {
        openConfirmDialog($("#launchSimButton"), "Are you sure you want to launch a simulation?", "Confirm Simulation Launch");
    });

    $("#stopSimButton").on("confirmDialog", function() {
        $("#stopSimButton").hide();
        $("#launchSimButton").show();
    });

    $("#stopSimButton").click(function() {
        openConfirmDialog($("#stopSimButton"), "Are you sure you wish to end the currently running simulation?", "Confirm Stop Simulation");
    });

    //$("#launchSimButton").prop("disabled", true);
    //$("#stopSimButton").prop("disabled", true);

});

function openConfirmDialog(obj, dialogText, dialogTitle) {
    dialogTitle = dialogTitle || "Confirm";

    bootbox.dialog({
        title: dialogTitle,
        message: dialogText,
        buttons: {
            no: {
                label: "No",
                className: "btn-danger btn-md",
                callback: function() {}
            },
            yes: {
                label: "Yes",
                className: "btn-success btn-md",
                callback: function() {
                    obj.trigger("confirmDialog");
                }
            }
        }
    });
}
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




function generateOutputForm() {

    for(var i = 0; i < simOutput.length; i++) {
        $('simoutput_' + simOutput[i])
    }

    var id = simOutput.length;

    var formtext = '<div class="panel panel-default">\
                        <div class="panel-heading">\
                            <h4 class="panel-title">\
                                <a id="simOutputFormCollapse'+id+'" data-toggle="collapse" data-parent="#simOutputPanel" href="#simout_'+id+'">\
                                    Output '+id+'\
                                </a>\
                            </h4>\
                        </div>\
                        <div id="simout_'+id+'" class="panel-collapse collapse in">\
                            <form id="simulationOutputForm">\
                                <!-- Name of Simulation input -->\
                                <div class="form-group">\
                                    <label for="simOutputType' + id + '">Output Type</label>\
                                    <select class="form-control" id="simOutputType' + id + '">\
                                        <option value="report">View Report</option>\
                                        <option value="file">Save as File</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group simOutputFileOnly">\
                                    <label for="simOutputFileName' + id + '">FileName</label>\
                                    <input id="simOutputFileName' + id + '" type="text" placeholder="File Name" class="form-control">\
                                </div>\
    \
                                <div class="form-group simOutputFileOnly">\
                                    <label for="simOutputNumberFormat' + id + '">Number Format</label>\
                                    <select class="form-control" id="simOutputNumberFormat' + id + '">\
                                        <option value="ascii">ascii</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputReportType' + id + '">Report Type</label>\
                                    <select class="form-control" id="simOutputReportType' + id + '">\
                                        <option value="channel_conductance">Channel Conductance</option>\
                                        <option value="report2">Report 2</option>\
                                        <option value="report3">Report 3</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputReportTarget' + id + '">Report Target</label>\
                                    <select class="form-control" id="simOutputReportTarget' + id + '">\
                                        <option value="alias_1">Cell Alias 1</option>\
                                        <option value="alias_2">Cell Alias 2</option>\
                                        <option value="alias_3">Cell Alias 3</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputProbability' + id + '">Probability</label>\
                                    <input id="simOutputProbability' + id + '" type="number" placeholder="0.5" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputFrequency' + id + '">Frequency</label>\
                                    <input id="simOutputFrequency' + id + '" type="number" placeholder="5" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputStartTime' + id + '">Start Time</label>\
                                    <input id="simOutputStartTime' + id + '" type="number" placeholder="0" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputEndTime' + id + '">End Time</label>\
                                    <input id="simOutputEndTime' + id + '" type="number" placeholder="0" class="form-control">\
                                </div>\
                            </form>\
                        </div>\
                    </div>';

    $("#simOutputPanel").append(formtext);

    simOutput.push(id);
}

//}