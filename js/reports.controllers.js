var utilityFcns = require('./utilityFcns');
var app = require('./app');
var ncbApp = app.ncbApp;
//require('angular');

function Socket(id) {
    this.id = id;
}

Socket.prototype = {
    connect: function($scope) {
        $scope.reportData = [];
        var address = 'ws://localhost:8000/report-' + this.id;
        var socket = new WebSocket(address);
        console.log(socket);

        socket.onopen = function() {
            console.log('Success!');
            socket.send('test');
        };

        socket.onerror = function() {
            console.log("Error in report socket!");
        };

        socket.onclose = function() {
            console.log('Report Socket Closed!');
            console.log($scope.reportData);
            socket.close();
            $scope.$apply();
        };

        socket.onmessage = function(message) {
            var data = JSON.parse(message.data);
            console.log("Report: " + data);
            //console.log($scope);
            $scope.reportData.push(data);
            $scope.$apply();
        };

        this.socket = socket;
    }
};

ncbApp.controller('ReportsController', ['$scope', function($scope) {
    $scope.reportData = [];
    $scope.started = false;

    $scope.start = function() {
        console.log("Reports Started");

        if(!$scope.started) {
            var websocket = new Socket(0);
            websocket.connect($scope);
            $scope.started = true;
        }
    };


}]);