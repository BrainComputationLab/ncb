require('angular');
var utilityFcns = require('./utilityFcns');
var app = require('./app');
//var Rickshaw = require("rickshaw");
var $ = require('jquery');
var Highcharts = require('highcharts/highstock');
var ncbApp = app.ncbApp;
require('highcharts/modules/exporting')(Highcharts);

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
        for(var i = 0; i < $scope.reports.length; i++) {
            var report = $scope.reports[i];
            if(report != null && report.chart != null) {
                var series = report.chart.series[0];

                var gradients = [[0, report.minGradient]];
                for(var j = 0; j < report.thresholds.length; j++) {
                    var thresh = report.thresholds[j];
                    var pos = (thresh.pos - $scope.minDataValue) / ($scope.maxDataValue - $scope.minDataValue);
                    gradients.push([pos, thresh.gradient]);
                }
                gradients.push([1, report.maxGradient]);

                gradients.sort(thresholdSort);

                var options = series.options;
                options.color = {
                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0},
                    stops: gradients
                };

                series.update(options, true);
            }
        }

    };

    $scope.$watch(function() {
        return $scope.reports.map(function(report) {
            return report.minGradient;
        });
    }, $scope.updateGradients, true);
    $scope.$watch(function() {
        return $scope.reports.map(function(report) {
            return report.maxGradient;
        });
    }, $scope.updateGradients, true);
    $scope.$watch(function() {
        return $scope.reports.map(function(report) {
            return report.thresholds;
        });
    }, $scope.updateGradients, true);

    $scope.maxDataValue = 1;
    $scope.minDataValue = 0;

    $scope.$watch(function() {
            if($scope.selectedReport != null && $scope.selectedReport.chart != null) {
                return $scope.selectedReport.chart.yAxis[0].getExtremes();
            }

            return null;
        }, function(newVal, oldVal) {
            if(newVal != undefined && newVal != null) {
                $scope.maxDataValue = Math.floor(newVal.dataMax);
                $scope.minDataValue = Math.floor(newVal.dataMin);
            }
    }, true);

    $scope.updatePlotlines = function() {
        if($scope.selectedReport != null && $scope.selectedReport.chart != null && $scope.selectedReport.plotlines != null) {
            var yAxis = $scope.selectedReport.chart.yAxis[0];
            $scope.selectedReport.plotlines.forEach(function(plotline) {
                yAxis.removePlotLine(plotline.id);
                yAxis.addPlotLine(plotline);
            });

        }
    };

    $scope.$watch('selectedReport.plotlines', $scope.updatePlotlines, true);

    $interval(function() {
        //if($scope.selectedReport != null) {
        for(var i = 0; i < $scope.reports.length; i++) {
            var series = $scope.reports[i].chart.series[0];
            for(var j = 0; j < 1; j++) {
                series.addPoint((Math.random() * 141) - 60, false);
            }

            $scope.reports[i].chart.redraw();
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

    $scope.initialized = false;

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
                    }],
                    plotlines : [],
                    displayed : true
                },
                {
                    data : [],
                    chart : null,
                    name : 'Current Report',
                    minGradient : 'rgb(0,0,255)',
                    maxGradient : 'rgb(0,255,0)',
                    thresholds : [],
                    plotlines : [],
                    displayed : true
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
        $scope.setActiveSim(0);
        $scope.initialized = true;
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
                        var pos = (thresh.pos - $scope.minDataValue) / ($scope.maxDataValue - $scope.minDataValue);
                        gradients.push([thresh.pos, thresh.gradient]);
                    }

                    gradients.push([1, report.maxGradient]);

                    gradients.sort(thresholdSort);

                    report.chart = new Highcharts.StockChart({
                        chart : {
                            renderTo : 'reportchart-' + report.name,
                            type : 'line'
                        },

                        // title: {
                        //     text : report.name
                        // },

                        xAxis : {
                            title : {
                                text : 'Time (seconds)'
                            },

                            dateTimeLabelFormats : {
                                millisecond: '%S.%L',
                                second : '%H:%S.%L'
                            }
                            // min : 6,
                            // max : 10

                        },

                        yAxis : {
                            title : {
                                text : 'Synapse Voltage'
                            },

                            offset : 50,

                            min: -80,
                            max: 65
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

                                marker : {
                                    enabled : true,
                                    radius : 3
                                },

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

        $timeout(function() {
            var chart = $scope.selectedReport.chart;
            chart.setSize(document.getElementById('reportchart-' + $scope.selectedReport.name).clientWidth, 400, false);
        });
    };

    $scope.getReportsForSelectedSim = function() {
        if($scope.selectedSim != null)
            return $scope.selectedSim.reports;

        return [];
    };

    $scope.addThreshold = function(report) {
        if(report != null) {
            report.thresholds.push({
                pos : 0.0,
                gradient : 'rgb(0,0,0)'
            });
        }
    };

    $scope.removeThreshold = function(report, index) {
        if(report != null) {
            if(index >= 0 && index < report.thresholds.length) {
                report.thresholds.splice(index, 1);
            }
        }
    };

    $scope.addPlotline = function(report) {
        if(report != null) {
            var plotline = {
                id : guid(),
                value : $scope.minDataValue,
                color : 'rgb(255,0,0)',
                dashStyle : 'shortdash',
                width : 2,
                label : {
                    text : 'Plotline ' + (report.plotlines.length + 1)
                },
                zIndex : 1000
            };

            report.plotlines.push(plotline);

            var yAxis = report.chart.yAxis[0];
            yAxis.addPlotLine(plotline);
        }
    };

    $scope.removePlotline = function(report, index) {
        if(report != null) {
            if(index >= 0 && index < report.plotlines.length) {
                var plotline = report.plotlines[index];
                report.plotlines.splice(index, 1);

                var yAxis = report.chart.yAxis[0];
                yAxis.removePlotLine(plotline.id);
            }
        }
    };

    // $scope.currentPlotline = -1;
    // $scope.setCurrentPlotline = function(index) {
    //     if($scope.selectedReport != null) {
    //         if(index >= 0 && index < $scope.selectedReport.plotlines.length) {
    //             $scope.currentPlotline = index;
    //         }
    //     }
    // };

}]);

// found on stackoverflow.com http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}