
function sendJSON(jsonObj) {
    var request = $.ajax({
		url: '/json',
		type: 'POST',

		data: JSON.stringify(jsonObj),
		dataType: "json",
		contentType: "application/json; charset=utf-8",
		async: false,
		timeout: 10000 // 10 seconds
	});

	request.done(function(response, textStatus, jqXHR) {
		console.log("JSON Successfully Uploaded");
	});
}

function getJSON(serverUrl) {
	var jsonObj;
	serverUrl = serverUrl || "/json";
	$.ajax({
		datatype: "json",
		url: serverUrl,
		type: "GET",
		data: {},
		success: function(data, textStatus, jqXHR) {
			jsonObj = data;
			console.log("JSON Successfully Received");
		},
		async: false,
		timeout: 5000 // 5 seconds
	})

	return jsonObj;
}

// testing area
$().ready(function() {
    conn = {"name" : "Cameron", "age" : 22};
    sendJSON(conn);
    var recData = getJSON();
    console.log(recData);
});
