require('angular');
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

ncbApp.controller('ReportsController', ['$scope', '$http', '$interval', '$timeout',
                    function($scope, $http, $interval, $timeout) {

    $scope.reportData = [];
    $scope.started = false;
    $scope.intervals = [];

    $scope.testData = [ { x: 0.0, y: 40 }, { x: 0.5, y: 30}, { x: 1.0, y: 49 }, { x: 2.0, y: 17 }, { x: 3.0, y: 42 } ];

    var thresholdSort = function(first, second) {
        if(first.pos < second.pos) {
            return -1;
        }

        if(first.pos > second.pos) {
            return 1;
        }

        return 0;
    };

    $scope.updateGradients = function() {
        if($scope.selectedReport != null && $scope.selectedReport.chart != null) {
            var series = $scope.selectedReport.chart.series[0];

            var gradients = [[0, $scope.selectedReport.minGradient]];
            for(var j = 0; j < $scope.selectedReport.thresholds.length; j++) {
                var thresh = $scope.selectedReport.thresholds[j];
                gradients.push([thresh.pos, thresh.gradient]);
            }
            gradients.push([1, $scope.selectedReport.maxGradient]);

            gradients.sort(thresholdSort);

            var options = series.options;
            options.color = {
                linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0},
                stops: gradients
            };

            series.update(options, true);
        }
    };

    $scope.$watch('selectedReport.minGradient', $scope.updateGradients);
    $scope.$watch('selectedReport.maxGradient', $scope.updateGradients);
    $scope.$watch('selectedReport.thresholds', $scope.updateGradients, true);

    $interval(function() {
        //if($scope.selectedReport != null) {
        for(var i = 0; i < $scope.reports.length; i++) {
            var series = $scope.reports[i].chart.series[0];
            series.addPoint(Math.random() * 11, true);
        }
        //}
    }, 1000, 0, false);




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

        $scope.simulations = [{
            name : 'Sim 1',
            reports : [
                {
                    data : [],
                    chart : null,
                    name : 'Synapse Report',
                    minGradient : 'rgb(255,0,0)',
                    maxGradient : 'rgb(0,0,255)',
                    thresholds : [{
                        pos : 0.5,
                        gradient : 'rgb(0,255,0)'
                    }]
                },
                {
                    data : [],
                    chart : null,
                    name : 'Current Report',
                    minGradient : 'rgb(0,0,255)',
                    maxGradient : 'rgb(0,255,0)',
                    thresholds : []
                }
            ]
        }];

        // $http.get('/get-report-specs')
        //     .success(function(data, status, headers, config) {
        //         console.log('get-report-specs');

        //         if(data.success) {
        //             $scope.simulations = data.simulations;
        //         }

        //         console.log("reports");
        //         console.log($scope.simulations);

        //         if($scope.simulations.length > 0) {
        //             $scope.setActiveSim(0);
        //         }
        //   }).
        //   error(function(data, status, headers, config) {
        //     // called asynchronously if an error occurs
        //     // or server returns response with an error status.
        //     console.error(status);
        //   });

        // callback();

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

            $timeout(function() {
                for(var i = 0; i < $scope.reports.length; i++) {
                    var report = $scope.reports[i];

                    var gradients = [[0, report.minGradient]];

                    for(var j = 0; j < report.thresholds.length; j++) {
                        var thresh = report.thresholds[j];
                        gradients.push([thresh.pos, thresh.gradient]);
                    }

                    gradients.push([1, report.maxGradient]);

                    gradients.sort(thresholdSort);

                    report.chart = new Highcharts.StockChart({
                        chart : {
                            renderTo : 'reportchart-' + report.name,
                            type : 'spline'
                        },

                        // title: {
                        //     text : report.name
                        // },

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

                        visible : false,

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
                                color : {
                                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0},
                                    stops: gradients
                                },
                                name : 'Voltage',
                                data : report.data//[30, 40, 50, 40, 30]
                                //pointStart : new Date(),
                                //pointInterval : 1
                            }
                        ]
                    });
                }
            });


        }
    };

    $scope.isActiveReport = function(index) {
        return index === $scope.activeReport;
    };

    $scope.setActiveReport = function(index) {
        $scope.activeReport = index;
        $scope.selectedReport = $scope.reports[index];

        // var chart = $scope.selectedReport.chart;
        // chart.setSize(document.getElementById('reportchart-' + $scope.selectedReport.name).clientWidth, 400);
    };

    $scope.getReportsForSelectedSim = function() {
        if($scope.selectedSim != null)
            return $scope.selectedSim.reports;

        return [];
    };

    $scope.addThreshold = function() {
        if($scope.selectedReport != null) {
            $scope.selectedReport.thresholds.push({
                pos : 0.0,
                gradient : 'rgb(0,0,0)'
            });
        }
    };

    $scope.removeThreshold = function(index) {
        if($scope.selectedReport != null) {
            if(index >= 0 && index < $scope.selectedReport.thresholds.length) {
                $scope.selectedReport.thresholds.splice(index, 1);
            }
        }
    };

}]);