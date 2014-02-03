
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
    conn = {"name" : "Cameron", "age" : 22};
    sendJSON(conn);
    var recData = getJSON();
    console.log(recData);
});
