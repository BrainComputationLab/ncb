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

ncbApp.controller('ReportsController', ['$scope', '$http', '$interval',
                    function($scope, $http, $interval) {

    $scope.reportData = [];
    $scope.started = false;
    $scope.intervals = [];
    $scope.reports = [
        {
            'name' : 'Sim 1',
            'outputs' : [
                {
                    'name' : 'Rep1',
                    'data' : []
                },

                {
                    'name' : 'Rep2',
                    'data' : []
                }
            ]
        },

        {
            'name' : 'Sim 2',
            'outputs' : [
                {
                    'name' : 'Rep3',
                    'data' : []
                }
            ]
        }
    ];

    $scope.activeSim = 0;
    $scope.activeReport = 0;

    $scope.selectedSim = $scope.reports[$scope.activeSim];
    $scope.selectedReport = $scope.reports[$scope.activeSim].outputs[$scope.activeReport];

    var callback = function(sim, report) {

        $scope.intervals.push($interval(function() {
            var simid = sim * $scope.reports.length + report;
            var request = $http.get('/teststream-' + simid);

            request.success(function(data, status, headers, config) {
                var arr = $scope.reports[sim].outputs[report].data;
                arr.push.apply(arr, data.data);
            });

            request.error(function(data, status, headers, config) {
                console.log("Error!!!!");
                $interval.cancel($scope.intervals[simid]);
            });
        }, 1000, 0, false));
    };

    $scope.start = function() {
        console.log("Reports Started");

        callback(0,0);
        callback(0,1);
        callback(1,0);

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

    $scope.isActiveSim = function(index) {
        return index === $scope.activeSim;
    };

    $scope.setActiveSim = function(index) {
        if(index !== $scope.activeSim) {
            $scope.activeSim = index;
            $scope.activeReport = 0;

            $scope.selectedSim = $scope.reports[$scope.activeSim];
            $scope.selectedReport = $scope.reports[$scope.activeSim].outputs[$scope.activeReport];
        }
    };

    $scope.isActiveReport = function(index) {
        return index === $scope.activeReport;
    };

    $scope.setActiveReport = function(index) {
        $scope.activeReport = index;
        $scope.selectedReport = $scope.reports[$scope.activeSim].outputs[$scope.activeReport];
    };

}]);