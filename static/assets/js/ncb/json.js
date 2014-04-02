
function sendJSON(jsonObj) {
    var request = $.ajax({
        url: '/json',
        type: 'POST',

        data: JSON.stringify(jsonObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        async: false,
        timeout: 15000 // 15 seconds
    });

    request.done(function(response, textStatus, jqXHR) {
        console.log("JSON Successfully Uploaded");
    });
}

function getJSON() {
    var jsonObj;
    $.ajax({
        datatype: "json",
        url: "/json",
        type: "GET",
        data: {},
        success: function(data, textStatus, jqXHR) {
            jsonObj = data.model;

            console.log("JSON Successfully Received");
        },
        async: false,
        timeout: 15000 // 15 seconds
    })

    return jsonObj;
}