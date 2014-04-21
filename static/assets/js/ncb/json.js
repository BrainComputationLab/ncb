
$().ready(function() {
    $("#export_modal").on("show.bs.modal", function() {
        // enable modal control buttons
        $(".import_export_buttons").prop("disabled", false);
    });

    $("#import_modal").on("show.bs.modal", function() {
        // hide possible error message
        $("#possible_import_error").hide();
        $(".import_export_buttons").prop("disabled", false);

        $("#uploadProgress").attr("style", "width: 0%");
        $("#uploadProgress").hide();

        clearUploadFileInput();

    });

    $("#uploadFile").change(function() {
        var file = this.files[0];
        var fileName = file.name;
        var fileExtensionArr = fileName.split('.');
        var fileExtension = fileExtensionArr[fileExtensionArr.length-1];
        // check for correct file extensions
        if(fileName === '' || fileExtension === 'json' || fileExtension === 'py') {
            // hide possible error message
            $("#possible_import_error").hide();
            // enable Ok button
            $("#importOkButton").prop("disabled", false);
        }

        // else incorrect file type
        else {
            // show error if incorrect file type
            $("#possible_import_error").show();
            // disable Ok button
            $("#importOkButton").prop("disabled", true);
        }
    });

    $("#exportFileName").on('input', function() {
        var fileName = $("#exportFileName").val();
        
        if(fileName === '' || fileName === undefined) {
            $("#exportOkButton").prop("disabled", true);
        }

        else {
            $("#exportOkButton").prop("disabled", false);
        }
    });
});

// function for clearing the input file field
function clearUploadFileInput()
{
    var fileInput = $("#uploadFile");
    fileInput.replaceWith(fileInput.clone(true));
}


function exportSim() {
    var stimuli = [];
    var reports = [];
    var id;
    for(var i = 0; i < simInput.length; i++) {
        id = simInput[i];
        stimuli.push({
            entity_name: $("#simInputFormCollapse" + id).html().trim(),
            entity_type: "stimulus",
            specification: {
                type: $("#simInputType" + id).val(),
                amplitude: parseFloat($("#simInputAmplitudeField" + id).val()),
                width: parseFloat($("#simInputWidthField" + id).val()),
                frequency: parseFloat($("#simInputFrequencyField" + id).val()),
                probability: parseFloat($("#simInputProbabilityField" + id).val()),
                time_start: parseInt($("#simInputStartTimeField" + id).val()),
                time_end: parseInt($("#simInputEndTimeField" + id).val()),
                target: $("#simInputTarget" + id).val()
            }
        });
    }

    for(var i = 0, obj; i < simOutput.length; i++) {
        id = simOutput[i];
        obj = {
            entity_name: $("#simOutputFormCollapse" + id).html().trim(),
            entity_type: "report",
            specification: {
                type: $("#simOutputReportType" + id).val(),
                report_target: $("#simOutputTarget" + id).val(),
                probability: parseFloat($("#simOutputProbability" + id).val()),
                frequency: parseFloat($("#simOutputFrequency" + id).val()),
                channel_types: [],
                time_start: parseInt($("#simOutputStartTime" + id).val()),
                time_end: parseInt($("#simOutputEndTime" + id).val())
            }
        };

        if($("#simOutputType" + id).val() === "file") {
            obj.specification.method = {
                type: "file",
                filename: $("#simOutputFileName" + id).val(),
                number_format: $("#simOutputNumberFormat" + id).val()
            };
        }

        else {
            obj.specification.method = {
                type: "view"
            };
        }

        reports.push(obj);
    }

    currentModel.stimuli = stimuli;
    currentModel.reports = reports;
    currentModel.filename = $("#exportFileName").val();
    currentModel.file_extension = $("#exportExtension").val();

    $.ajax({
        url: '/export',
        type: 'POST',

        data: JSON.stringify(currentModel),
        dataType: 'JSON',
        contentType: 'application/json; charset=utf-8',

        success: function(data, textStatus, jqXHR) {
            if(data !== undefined && data.success !== undefined && !data.success) {
                alert("Error in export!");
            }

            $("#export_modal").modal("hide");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Unable to export sim. Reason: " + errorThrown);
        },

    });
}

function importSim() {
    var uploadProgress = function(e) {
        if(e.lengthComputable) {
            var percentage = (e.loaded / e.totalSize) * 100;
            $("#uploadProgress").attr("aria-valuenow", percentage);
            $("#uploadProgress").attr("style", "width: " + percentage + "%");
        }
    };

    var fileData = new FormData($("#uploadForm")[0]);
    $.ajax({
        url: '/import',
        type: 'POST',

        data: fileData,

        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload) {
                myXhr.upload.addEventListener('progress', uploadProgress, false);
            }
            return myXhr;
        },

        success: function(data, textStatus, jqXHR) {
            currentModel = data;
            console.log("Upload Received");
            console.log(currentModel);
            updateSimElements();
            updateModelListViewAfterImport();
            $("#uploadProgress").hide();
            $("#import_modal").modal("hide");
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error in upload: " + errorThrown);
            alert("Error in upload: " + errorThrown);
            $(".import_export_buttons").prop("disabled", false);
        },
        // disable caching and uneeded functions
        cache: false,
        contentType: false,
        processData: false
    });  
}

function updateSimElements() {
    simBuilderUpdateTargets();
    // remove current inputs
    for(var i = 0; i < simInput.length; i++) {
        $("#simInputFormCollapseRemove" + simInput[i]).trigger("confirmDialog");
    }

    // remove current outputs
    for(var i = 0; i < simOutput.length; i++) {
        $("#simOutputFormCollapseRemove" + simOutput[i]).trigger("confirmDialog");
    }

    simInput = [];
    simOutput = [];

    for(var i = 0; i < currentModel.stimuli.length; i++) {
        var stim = currentModel.stimuli[i];
        var id = inputID;

        generateInputForm(stim.name);
        $("#simInputType" + id).val(stim.specification.type);
        $("#simInputAmplitudeField" + id).val(stim.specification.amplitude);
        $("#simInputFrequencyField" + id).val(stim.specification.frequency);
        $("#simInputProbabilityField" + id).val(stim.specification.probability);
        $("#simInputStartTimeField" + id).val(stim.specification.time_start);
        $("#simInputEndTimeField" + id).val(stim.specification.time_end);
        $("#simInputTarget" + id).val(stim.specification.target);
    }

    for(var i = 0; i < currentModel.reports.length; i++) {
        var rep = currentModel.reports[i];
        var id = outputID;

        generateOutputForm(rep.name);
        $("#simOutputReportType" + id).val(rep.specification.type);
        $("#simOutputTarget" + id).val(rep.specification.report_target);
        $("#simOutputProbability" + id).val(rep.specification.probability);
        $("#simOutputFrequency" + id).val(rep.specification.frequency);
        $("#simOutputStartTime" + id).val(rep.specification.time_start);
        $("#simOutputEndTime" + id).val(rep.specification.time_end);

        if(rep.specification.method.type === "file") {
            $("#simOutputType" + id).val("file");
            $("#simOutputFileName" + id).val(rep.specification.method.filename);
            $("#simOutputNumberFormat" + id).val(rep.specification.method.number_format);
        }

        else {
            $("#simOutputType" + id).val("view");
        }

        $("#simOutputType" + id).trigger("change");

        obj = {
            entity_name: $("#simOutputFormCollapse" + id).html().trim(),
            entity_type: "report",
            specification: {
                type: $("#simOutputReportType" + id).val(),
                report_target: $("#simOutputTarget" + id).val(),
                probability: parseFloat($("#simOutputProbability" + id).val()),
                frequency: parseFloat($("#simOutputFrequency" + id).val()),
                channel_types: [],
                time_start: parseInt($("#simOutputStartTime" + id).val()),
                time_end: parseInt($("#simOutputEndTime" + id).val())
            }
        };

        if($("#simOutputType" + id).val() === "file") {
            obj.specification.method = {
                type: "file",
                filename: $("#simOutputFileName" + id).val(),
                number_format: $("#simOutputNumberFormat" + id).val()
            };
        }

        else {
            obj.specification.method = {
                type: "view"
            };
        }
    }
}

