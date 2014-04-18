//var simProgressBar = $("#uploadSimProgress");
var simOutput = [];
var simInput = [];
var simInputTargetSelections = {};
var simOutputTargetSelections = {};

$().ready(function() {
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
/*
var objectFromUpload;
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
*/
function startGenOutputForm() {
    bootbox.prompt("Enter Output Name", function(result) {                
        if (result !== null && result !== '') {                                             
            generateOutputForm(result);
        }
    });
}

function startGenInputForm() {
    bootbox.prompt("Enter Stimulus Name", function(result) {
        if(result !== null && result !== '') {
            generateInputForm(result);
        }
    });
}

function getCurrentCellGroupOptions() {
    var currentCellGroupOptions = [];
    appendCurrentCellGroupOptions(currentModel.cellGroups, currentCellGroupOptions, 0);
    var optionStr = '';

    if(currentCellGroupOptions.length === 0) {
        optionStr += '<option value="none">No Cell Groups Available</option>';
    }

    else {
        for(var i = 0; i < currentCellGroupOptions.length; i++) {
            optionStr += '<option value="' + removeHTMLSpaceFromString(currentCellGroupOptions[i]);
            optionStr += '">' + currentCellGroupOptions[i];
            optionStr += '</option>';
        }
    }

    return optionStr;
}

function appendCurrentCellGroupOptions(cellGroup, currentOptions, currentLevel) {
    for(var i = 0; i < cellGroup.length; i++) {
        var space = '';
        for(var j = 0; j < currentLevel * 2; j++)
            space += '&nbsp;';

        currentOptions.push(space + '&bull; ' + cellGroup[i].name);
        appendCurrentCellGroupOptions(cellGroup[i].cellGroups, currentOptions, currentLevel + 1);
    }
}

function removeHTMLSpaceFromString(str) {
    return str.replace(/[&nbsp;|&bull;| ]/gi,'');
}

var inputID = 0;
function generateInputForm(inputName) {
    for(var i = 0; i < simInput.length; i++) {
        if(!isElementHidden($("#simulationInputForm" + simInput[i])))
            $("#simInputFormCollapse" + simInput[i]).click();
    }

    var formtext = '<div id="simInputFormOuterPanel' + inputID + '" class="panel panel-default">\
                        <div class="panel-heading">\
                            <h4 class="panel-title">\
                                <a id="simInputFormCollapse'+inputID+'" data-toggle="collapse" data-parent="#simInputPanel" href="#simin_'+inputID+'">\
                                    ' + inputName + '\
                                </a>\
                                <a id="simInputFormCollapseRemove' + inputID + '" class="btn btn-danger btn-xs pull-right" style="color: white;">- Remove</a>\
                            </h4>\
                        </div>\
                        <div id="simin_' + inputID + '" class="panel-collapse collapse in" style="margin-left: 20px;">\
                            <form id="simulationInputForm' + inputID + '">\
                                <!-- Name of Simulation input -->\
                                <div class="form-group">\
                                    <label for="simInputType' + inputID + '">Stimulus Type</label>\
                                    <select class="form-control" id="simInputType' + inputID + '">\
                                        <option value="rectangular_current">Rectangular Current</option>\
                                        <option value="rectangular_voltage">Rectangular Voltage</option>\
                                        <option value="linear_current">Linear Current</option>\
                                        <option value="linear_voltage">Linear Voltage</option>\
                                        <option value="sine_current">Sine Current</option>\
                                        <option value="sine_voltage">Sine Voltage</option>\
                                    </select>\
                                </div>\
    \
                                <div id="simInputAmplitude' + inputID + '" class="form-group">\
                                    <label for="simInputAmplitudeField' + inputID + '">Amplitude</label>\
                                    <input id="simInputAmplitudeField' + inputID + '" type="number" placeholder="ex. 2" class="form-control">\
                                </div>\
    \
                                <div id="simInputWidth' + inputID + '" class="form-group">\
                                    <label for="simInputWidthField' + inputID + '">Width</label>\
                                    <input class="form-control" id="simInputWidthField' + inputID + '" type="number" placeholder="ex. 3">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simInputFrequencyField' + inputID + '">Frequency</label>\
                                    <input class="form-control" id="simInputFrequencyField' + inputID + '" type="number" placeholder="ex. 10">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simInputProbabilityField' + inputID + '">Probability</label>\
                                    <input class="form-control" id="simInputProbabilityField' + inputID + '" type="number" placeholder="ex. 0.5">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simInputTarget' + inputID + '">Input Target</label>\
                                    <select class="form-control" id="simInputTarget' + inputID + '">\
                                        ' + getCurrentCellGroupOptions() + '\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simInputStartTimeField' + inputID + '">Start Time</label>\
                                    <input id="simInputStartTimeField' + inputID + '" type="number" placeholder="ex. 612789" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simInputEndTimeField' + inputID + '">End Time</label>\
                                    <input id="simInputEndTimeField' + inputID + '" type="number" placeholder="ex. 1378454" class="form-control">\
                                </div>\
                            </form>\
                        </div>\
                    </div>';

    $("#simInputPanel").append(formtext);
    var removeButton = $("#simInputFormCollapseRemove" + inputID);
    removeButton.on('confirmDialog', simInputRemoveFunction(inputID));
    removeButton.click(function() {
        openConfirmDialog(removeButton, "Are you sure you wish to remove stimulus: " + inputName + "?", "Confirm Stimulus Removal");
    });
    $("#simInputTarget" + inputID).change(simInputTargetChanged(inputID));

    simInput.push(inputID);

    inputID++;
}

function simInputRemoveFunction(newID) {
    return function() {
        $("#simInputFormOuterPanel" + newID).remove();
        var index = simInput.indexOf(newID);

        delete simInputTargetSelections[newID];

        if(index > -1) {
            simInput.splice(index, 1);
        }
    };
}

var outputID = 0;
function generateOutputForm(outputName) {
    for(var i = 0; i < simOutput.length; i++) {
        if(!isElementHidden($("#simulationOutputForm" + simOutput[i])))
            $("#simOutputFormCollapse" + simOutput[i]).click();
    }

    var formtext = '<div id="simOutputFormOuterPanel' + outputID + '" class="panel panel-default">\
                        <div class="panel-heading">\
                            <h4 class="panel-title">\
                                <a id="simOutputFormCollapse'+outputID+'" data-toggle="collapse" data-parent="#simOutputPanel" href="#simout_'+outputID+'">\
                                    ' + outputName + '\
                                </a>\
                                <a id="simOutputFormCollapseRemove' + outputID + '" class="btn btn-danger btn-xs pull-right" style="color: white;">- Remove</a>\
                            </h4>\
                        </div>\
                        <div id="simout_' + outputID + '" class="panel-collapse collapse in" style="margin-left: 20px;">\
                            <form id="simulationOutputForm' + outputID + '">\
                                <!-- Name of Simulation input -->\
                                <div class="form-group">\
                                    <label for="simOutputType' + outputID + '">Output Type</label>\
                                    <select class="form-control" id="simOutputType' + outputID + '">\
                                        <option value="view">View Report</option>\
                                        <option value="file">Save as File</option>\
                                    </select>\
                                </div>\
    \
                                <div id="simOutputFileField' + outputID + '" class="form-group simOutputFileOnly">\
                                    <label for="simOutputFileName' + outputID + '">FileName</label>\
                                    <input id="simOutputFileName' + outputID + '" type="text" placeholder="File Name" class="form-control">\
                                </div>\
    \
                                <div id="simOutputFileField2' + outputID + '" class="form-group">\
                                    <label for="simOutputNumberFormat' + outputID + '">Number Format</label>\
                                    <select class="form-control" id="simOutputNumberFormat' + outputID + '">\
                                        <option value="ascii">ascii</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputReportType' + outputID + '">Report Type</label>\
                                    <select class="form-control" id="simOutputReportType' + outputID + '">\
                                        <option value="channel_conductance">Channel Conductance</option>\
                                        <option value="report2">Report 2</option>\
                                        <option value="report3">Report 3</option>\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputReportTarget' + outputID + '">Report Target</label>\
                                    <select class="form-control" id="simOutputReportTarget' + outputID + '">\
                                        ' + getCurrentCellGroupOptions() + '\
                                    </select>\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputProbability' + outputID + '">Probability</label>\
                                    <input id="simOutputProbability' + outputID + '" type="number" placeholder="0.5" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputFrequency' + outputID + '">Frequency</label>\
                                    <input id="simOutputFrequency' + outputID + '" type="number" placeholder="5" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputStartTime' + outputID + '">Start Time</label>\
                                    <input id="simOutputStartTime' + outputID + '" type="number" placeholder="0" class="form-control">\
                                </div>\
    \
                                <div class="form-group">\
                                    <label for="simOutputEndTime' + outputID + '">End Time</label>\
                                    <input id="simOutputEndTime' + outputID + '" type="number" placeholder="0" class="form-control">\
                                </div>\
                            </form>\
                        </div>\
                    </div>';

    $("#simOutputPanel").append(formtext);

    $("#simOutputFileField" + outputID).hide();
    $("#simOutputFileField2" + outputID).hide();
    $("#simOutputType" + outputID).change(simOutputFileTypeFunction(outputID));
    $("#simOutputReportTarget" + outputID).change(simOutputTargetChanged(outputID));


    var removeButton = $("#simOutputFormCollapseRemove" + outputID);
    removeButton.on('confirmDialog', simOutputRemoveFunction(outputID));
    removeButton.click(function() {
        openConfirmDialog(removeButton, "Are you sure you wish to remove output: " + outputName + "?", "Confirm Output Removal");
    });

    simOutput.push(outputID);

    outputID++;
}

function simOutputFileTypeFunction(newID) {
    return function() {
        if($("#simOutputType" + newID).val() === "file") {
            $("#simOutputFileField" + newID).show();
            $("#simOutputFileField2" + newID).show();
        }

        else {
            $("#simOutputFileField" + newID).hide();
            $("#simOutputFileField2" + newID).hide();
        }
    };
}

function simOutputRemoveFunction(newID) {
    return function() {
        $("#simOutputFormOuterPanel" + newID).remove();
        var index = simOutput.indexOf(newID);

        delete simOutputTargetSelections[newID];
        if(index > -1) {
            simOutput.splice(index, 1);
        }
    };
}

function simOutputTargetChanged(newID) {
    return function() {
        simOutputTargetSelections[newID] = $("#simOutputReportTarget" + newID).val();
    };
}

function simInputTargetChanged(newID) {
    return function() {
        simInputTargetSelections[newID] = $("#simInputTarget" + newID).val();
    };
}

function simBuilderUpdateTargets() {
    var id, select, optionExists;

    for(var i = 0; i < simInput.length; i++) {
        id = simInput[i];
        select = $("#simInputTarget" + id);

        select.empty();
        select.append(getCurrentCellGroupOptions());
        console.log("Target updated");

        optionExists = $("#simInputTarget" + id + " option[value='" + simInputTargetSelections[id] + "']").length > 0;
        if(simInputTargetSelections[id] !== undefined && optionExists)
            select.val(simInputTargetSelections[id]);

    }

    for(var i = 0; i < simOutput.length; i++) {
        id = simOutput[i];
        select = $("#simOutputReportTarget" + id);

        select.empty();
        select.append(getCurrentCellGroupOptions());

        optionExists = $("#simOutputReportTarget" + id + " option[value='" + simInputTargetSelections[id] + "']").length > 0;
        if(simOutputTargetSelections[id] !== undefined && optionExists)
            select.val(simOutputTargetSelections[id]);
    }
}

function isElementHidden(element) {
    return (element.width() * element.height()) === 0;
}