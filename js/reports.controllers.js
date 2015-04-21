var utilityFcns = require('./utilityFcns');
var app = require('./app');
var ncbApp = app.ncbApp;

function Socket(id) {
    this.id = id;
}

Socket.prototype = {
    connect: function($scope) {
        $scope.reportData = [];
        var address = 'ws://localhost:8000/transfer';
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
            //console.log("Report: " + data);
            //console.log($scope);
            $scope.reportData.push(data);
            $scope.$apply();
        };

        this.socket = socket;
    }
};

// ncbApp.directive('keepScroll', function() {
//   return {
//     controller : function($scope){
//       var element = null;

//       this.setElement = function(el){
//         element = el;
//       }

//       this.addItem = function(item){
//         console.log("Adding item", item, item.clientHeight);
//         element.scrollTop = (element.scrollTop+item.clientHeight+1);
//        //1px for margin from your css (surely it would be possible
//        // to make it more generic, rather then hard-coding the value)
//       };

//     },

//     link : function(scope,el,attr, ctrl) {
//      ctrl.setElement(el[0]);
//     }
//   };
// });

// ncbApp.directive("scrollItem", function(){

//   return{
//     require : "^keepScroll",
//     link : function(scope, el, att, scrCtrl){
//       scrCtrl.addItem(el[0]);
//     }
//   };
// });

ncbApp.controller('ReportsController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {

    $scope.reportData = [];
    $scope.started = false;
    $scope.intervals = [];

    var callback = function(report) {
        var request = $http.get('/teststream-0');
            request.success(function(data, status, headers, config) {
                $scope.reportData.push.apply($scope.reportData, data.data);
            });

            request.error(function(data, status, headers, config) {
                console.log("Error!!!!");
                $interval.cancel($scope.intervals[report]);
            });
    };

    $scope.start = function() {
        console.log("Reports Started");

        $scope.intervals.push($interval(callback, 250, 0, false, 0));

        //if(!$scope.started) {
            // var websocket = new Socket(0);
            // websocket.connect($scope);


            // Oboe({
            //     url: '/teststream-0'
            // }).then(function() {
            //     //finished
            //     console.log('Done!');
            // },
            // function(error) {
            //     //error
            //     console.error(error);
            // },
            // function(node) {
            //     //data received
            //     console.log(node);
            // });

            //$scope.started = true;
        //}
    };

}]);