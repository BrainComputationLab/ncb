var utilityFcns = require('./utilityFcns');
var app = require('./app');
//var Rickshaw = require("rickshaw");
var $ = require('jquery');
var Highcharts = require('highcharts/highstock');
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

function findMinMax(series) {
    var result = { min : 100000.0, max : -100000.0 }

    for(var i = 0; i < series.length; i++) {
        var obj = series[i];
        if(result.min > obj.y) {
            result.min = obj.y;
        }

        if(result.max < obj.y) {
            result.max = obj.y;
        }
    }

    return result;
}

console.log(Highcharts);

ncbApp.controller('ReportsController', ['$scope', '$http', '$interval',
                    function($scope, $http, $interval) {

    $scope.reportData = [];
    $scope.started = false;
    $scope.intervals = [];

    $scope.testData = [ { x: 0.0, y: 40 }, { x: 0.5, y: 30}, { x: 1.0, y: 49 }, { x: 2.0, y: 17 }, { x: 3.0, y: 42 } ];

    $scope.chart = new Highcharts.StockChart({
        chart : {
            renderTo : 'testchart'
            //type : 'line'
        },

        title: {
            text : 'Report Example'
        },

        xAxis : {
            title : {
                text : 'Time (seconds)'
            },

            min : 6,
            max : 10

        },

        yAxis : {
            title : {
                text : 'Example Data'
            }
        },

        rangeSelector : {
            enabled : false
        },

        scrollbar : {
            enabled : true
            // barBackgroundColor: 'gray',
            // barBorderRadius: 7,
            // barBorderWidth: 0,
            // buttonBackgroundColor: 'gray',
            // buttonBorderWidth: 0,
            // buttonBorderRadius: 7,
            // trackBackgroundColor: 'none',
            // trackBorderWidth: 1,
            // trackBorderRadius: 8,
            // trackBorderColor: '#CCC'
        },

        series : [
            {
                name : 'Test1',
                data : []//[30, 40, 50, 40, 30]
                //pointStart : new Date(),
                //pointInterval : 1
            }
        ]
    });

    $interval(function() {
        var series = $scope.chart.series[0];
        series.addPoint(Math.floor(Math.random() * 11), true);

    }, 1000, 0, false);
//     var minmax = findMinMax($scope.testData);
//     console.log(minmax);

//     $scope.graph = new Rickshaw.Graph({
//         element : document.querySelector("#charttest"),
//         width : 580,
//         height : 500,
//         renderer : 'line',
//         stroke : true,
//         preserve : true,
//         min : minmax.min - 10,
//         max : minmax.max + 10,
//         series : [
//             { name : 'Test Data', color : 'steelblue', data : $scope.testData}
//         ]
//     });

//     var x_axis = new Rickshaw.Graph.Axis.Time( { graph : $scope.graph, timeFixture : new Rickshaw.Fixtures.Time.Local() });
//     var y_axis = new Rickshaw.Graph.Axis.Y({
//         graph : $scope.graph,
//         orientation : 'left',
//         tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
//         element : document.getElementById('charttest_y_axis')
//     });

//     var legend = new Rickshaw.Graph.Legend({ graph : $scope.graph, element : document.getElementById('charttest_legend')});

// //     var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({ graph : $scope.graph, legend : legend });

// //     var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
// //     graph: $scope.graph,
// //     legend: legend
// //     } );

// //     var order = new Rickshaw.Graph.Behavior.Series.Order( {
// //     graph: $scope.graph,
// //     legend: legend
// // } );

//     var hoverDetail = new Rickshaw.Graph.HoverDetail( {
//     graph: $scope.graph,
//     xFormatter: function(x) {
//         return 'Time: ' + x;
//         }
//     } );

//     var index = 4.0

//     $interval(function() {
//         $scope.testData.shift();
//         $scope.testData.push({ x : index, y : (Math.random() * (45 - 15) + 15)});
//         index += 5.0;
//         $scope.graph.render();
//     }, 5000, 0, false);
//     $scope.graph.render();
//     x_axis.render();
//     y_axis.render();
    // $scope.reports = [
    //     {
    //         'name' : 'Sim 1',
    //         'outputs' : [
    //             {
    //                 'name' : 'Rep1',
    //                 'data' : []
    //             },

    //             {
    //                 'name' : 'Rep2',
    //                 'data' : []
    //             }
    //         ]
    //     },

    //     {
    //         'name' : 'Sim 2',
    //         'outputs' : [
    //             {
    //                 'name' : 'Rep3',
    //                 'data' : []
    //             }
    //         ]
    //     }
    // ];

    $scope.simulations = [];
    $scope.reports = [];

    $scope.activeSim = -1;
    $scope.activeReport = -1;

    $scope.selectedSim = null;//$scope.reports[$scope.activeSim];
    $scope.selectedReport = null;//$scope.reports[$scope.activeSim].outputs[$scope.activeReport];

    var callback = function() {

        $scope.intervals.push($interval(function() {
            var request = $http.get('/stream-' + $scope.selectedSim.name + '-' + $scope.selectedReport.name);

            request.success(function(data, status, headers, config) {
                var arr = $scope.selectedReport.data;
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

        $http.get('/get-report-specs')
            .success(function(data, status, headers, config) {
                console.log('get-report-specs');

                if(data.success) {
                    $scope.simulations = data.simulations;
                }

                console.log("reports");
                console.log($scope.simulations);

                if($scope.simulations.length > 0) {
                    $scope.setActiveSim(0);
                }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.error(status);
          });

        callback();
        //callback(0,1);
        //callback(1,0);

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

            $scope.selectedSim = $scope.simulations[$scope.activeSim];
            $scope.reports = $scope.selectedSim.reports;

            if($scope.reports.length > 0) {
                $scope.selectedReport = $scope.reports[$scope.activeReport];
            }
        }
    };

    $scope.isActiveReport = function(index) {
        return index === $scope.activeReport;
    };

    $scope.setActiveReport = function(index) {
        $scope.activeReport = index;
        $scope.selectedReport = $scope.reports[index];
    };

    $scope.getReportsForSelectedSim = function() {
        if($scope.selectedSim != null)
            return $scope.selectedSim.reports;

        return [];
    };

}]);