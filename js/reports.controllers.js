require('angular');
var utilityFcns = require('./utilityFcns');
var app = require('./app');
//var Rickshaw = require("rickshaw");
var $ = require('jquery');
var Highcharts = require('highcharts/highstock');
var ncbApp = app.ncbApp;
require('highcharts/modules/exporting')(Highcharts);

Highcharts.setOptions({
    global : {
        useUTC : false
    }
});

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

    $scope.$watch(function() {
        return $scope.reports.map(function(report) {
            return report.plotlines;
        })
    }, $scope.updatePlotlines, true);

    // $interval(function() {
    //     //if($scope.selectedReport != null) {
    //     for(var i = 0; i < $scope.reports.length; i++) {
    //         var series = $scope.reports[i].chart.series[0];
    //         for(var j = 0; j < 10; j++) {
    //             series.addPoint((Math.random() * 141) - 60, false);
    //         }

    //         $scope.reports[i].chart.redraw();
    //     }
    //     //}
    // }, 5000, 0, false);




    $scope.simulations = [];
    $scope.reports = [];

    $scope.activeSim = -1;
    $scope.activeReport = -1;

    $scope.selectedSim = null;//$scope.reports[$scope.activeSim];
    $scope.selectedReport = null;//$scope.reports[$scope.activeSim].outputs[$scope.activeReport];

    var callback = function() {

    };

    $scope.initialized = false;

    $scope.start = function() {
        console.log("Reports Started");

        // $scope.simulations = [{
        //     name : 'Sim 1',
        //     reports : [
        //         {
        //             data : [[]],
        //             chart : null,
        //             name : 'Neuron Voltage Report',
        //             minGradient : 'rgb(255,0,0)',
        //             maxGradient : 'rgb(0,0,255)',
        //             thresholds : [{
        //                 pos : 0.5,
        //                 gradient : 'rgb(0,255,0)'
        //             }],
        //             plotlines : [],
        //             displayed : true,
        //             reportType : 'Voltage'
        //         },
        //         {
        //             data : [[]],
        //             chart : null,
        //             name : 'Synaptic Current Report',
        //             minGradient : 'rgb(0,0,255)',
        //             maxGradient : 'rgb(0,255,0)',
        //             thresholds : [],
        //             plotlines : [],
        //             displayed : true,
        //             reportType : 'Current'
        //         }
        //     ]
        // }];

        $http.get('/get-report-specs')
            .success(function(data, status, headers, config) {
                console.log('get-report-specs');

                if(data.success) {
                    $scope.simulations = data.simulations;
                }

                console.log("reports");
                console.log($scope.simulations);

                if($scope.simulations.length > 0) {
                    $scope.setActiveSim(0, false);

                    // for(var i = 0; i < $scope.reports.length; i++) {
                    //     var reort = $scope.reports[i];
                    //     $scope.intervals.push($interval(function() {
                    //         var request = $http.get('/stream-' + $scope.simulations[0].name + '-' + report.name);

                    //         request.success(function(data, status, headers, config) {
                    //             if(data.success) {
                    //                 for(var j = 0; j < data.data.length; j++) {
                    //                     report.chart.series[j].addPoint()
                    //                 }
                    //             }
                    //             else {
                    //                 console.log("Stream unsuccessful: " + data.reason);
                    //                 $interval.cancel($scope.intervals[i]);
                    //                 $scope.intervals.splice(i, 1);
                    //             }
                    //         });

                    //         request.error(function(data, status, headers, config) {
                    //             console.log("Stream Error");
                    //             $interval.cancel($scope.intervals[i]);
                    //         });
                    //     }, 250, 0, false));
                    // }

                    $scope.initialized = true;
                }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.error(status);
          });
    };

    $scope.startFromUpload = function(reportDataObj) {
        console.log("UPLOAD");
        console.log(reportDataObj);

        if($scope.simulations.length == 0) {
            $scope.simulations = [{
                name : reportDataObj.filename + ' Simulation',
                reports : [{
                    data : reportDataObj.data,
                    chart : null,
                    name : reportDataObj.filename,
                    minGradient : 'rgb(255,0,0)',
                    maxGradient : 'rgb(0,0,255)',
                    thresholds : [],
                    plotlines : [],
                    displayed : true,
                    reportType : reportDataObj.type
                }]
            }];
        }
        else {
            $scope.simulations[0].reports.push({
                data : reportDataObj.data,
                chart : null,
                name : reportDataObj.filename,
                minGradient : 'rgb(255,0,0)',
                maxGradient : 'rgb(0,0,255)',
                thresholds : [],
                plotlines : [],
                displayed : true,
                reportType : reportDataObj.type
            });
        }

        $scope.setActiveSim(0, true);
        $scope.initialized = true;
    };

    $scope.$on('start-report-upload', function(event, reportObj) {
        $scope.startFromUpload(reportObj);
    });

    $scope.isActiveSim = function(index) {
        return index === $scope.activeSim;
    };

    $scope.setActiveSim = function(index, upload) {
        if(index < $scope.simulations.length) {
            $scope.activeSim = index;
            $scope.activeReport = 0;

            $scope.selectedSim = $scope.simulations[$scope.activeSim];
            $scope.reports = $scope.selectedSim.reports;

            if($scope.reports.length > 0) {
                $scope.selectedReport = $scope.reports[$scope.activeReport];
            }

            // found on stackoverflow: http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function
            var defaultFor = function(arg, val) {
                return (typeof arg !== 'undefined') ? arg : val;
            };

            //             data : [[]],
            //             chart : null,
            //             name : 'Neuron Voltage Report',
            //             minGradient : 'rgb(255,0,0)',
            //             maxGradient : 'rgb(0,0,255)',
            //             thresholds : [{
            //                 pos : 0.5,
            //                 gradient : 'rgb(0,255,0)'
            //             }],
            //             plotlines : [],
            //             displayed : true,
            //             reportType : 'Voltage'

            upload = defaultFor(upload, false);

            $timeout(function() {
                for(var i = 0; i < $scope.reports.length; i++) {
                    var report = $scope.reports[i];

                    console.log(report.chart);

                    if(report.chart != null) {
                        console.log("SKIPPING");
                        continue;
                    }

                    // set default values if not present
                    report.minGradient = defaultFor(report.minGradient, 'rgb(255,0,0)');
                    report.maxGradient = defaultFor(report.maxGradient, 'rgb(0,0,255)');
                    report.thresholds  = defaultFor(report.thresholds, []);
                    report.plotlines   = defaultFor(report.plotlines, []);
                    report.displayed   = defaultFor(report.displayed, true);

                    console.log("REPORT BUILDER");
                    console.log(report);

                    if(!upload) {
                        report.data = [report.data];
                    }

                    var gradients = [[0, report.minGradient]];

                    for(var j = 0; j < report.thresholds.length; j++) {
                        var thresh = report.thresholds[j];
                        var pos = (thresh.pos - $scope.minDataValue) / ($scope.maxDataValue - $scope.minDataValue);
                        gradients.push([thresh.pos, thresh.gradient]);
                    }

                    gradients.push([1, report.maxGradient]);

                    gradients.sort(thresholdSort);

                    // for(var z = 0; z < report.data.length; z++) {
                    //     report.data[z] = Math.floor(report.data[z]);
                    // }
                    var axisTitle = 'Data';
                    var neuron_fire = false;
                    if(report.reportType) {
                        if(report.reportType.includes('Voltage')) {
                            axisTitle = 'Voltage (mV)';
                        }

                        else if(report.reportType.includes('Current')) {
                            axisTitle = 'Current (mA)';
                        }

                        else if(report.reportType.includes('Fire')){
                            axisTitle = 'Cell Count';
                            neuron_fire = true;
                        }
                    }

                    report.chart = new Highcharts.StockChart({
                        chart : {
                            renderTo : 'reportchart-' + report.name,
                            type : neuron_fire ? 'scatter' : 'line'
                        },

                        exporting : {
                            filename : report.name
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
                                text : axisTitle
                            },

                            offset : 50,

                            allowDecimals : !neuron_fire
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
                        }
                    });

                    if(neuron_fire) {
                        // var fireData = [];
                        // for(var j = 0; j < report.data.length; j++) {
                        //     fireData.push({

                        //     });
                        // }
                        report.chart.addSeries({
                            color : 'rgb(0,0,0)',
                            name : 'Cells Fired',

                            marker : {
                                enabled : true,
                                radius : 3
                            },

                            tooltip : {
                                headerFormat : '<span style="font-size: 10px">Time: {point.x}ms</span><br/>',
                                pointFormat: '<span style="color:{point.color}">\u25CF</span> Cells Fired: <b>{point.y}</b><br/>'
                            },

                            data : report.data//[30, 40, 50, 40, 30]
                            //pointStart : new Date(),
                            //pointInterval : 1
                        }, false);
                    }

                    else {
                        for(var j = 0; j < report.data.length; j++) {

                            // for(var k = 0; k < report.data[j].length; k++) {
                            //     report.data[j][k] = parseFloat(report.data[j][k]);
                            // }
                            report.chart.addSeries({
                                color : {
                                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0},
                                    stops: gradients
                                },
                                name : 'Voltage' + (j + 1),

                                // marker : {
                                //     enabled : true,
                                //     radius : 3
                                // },
                                tooltip : {
                                    headerFormat : '<span style="font-size: 10px">Time: {point.x}ms</span><br/>'
                                },

                                data : report.data[j]//[30, 40, 50, 40, 30]
                                //pointStart : new Date(),
                                //pointInterval : 1
                            }, false);

                            console.log("CALLED");
                        }
                    }

                    //if(upload) {
                        report.chart.redraw();
                    //}
                }

                console.log("SERIES");
                console.log(report.chart.series);
            });

            if(!upload) {
                $timeout(function() {
                    for(var j = 0; j < $scope.reports.length; j++) {
                        $scope.reports[j].chart.reflow();
                    }
                }, 100);
            }
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

ncbApp.controller('ReportUploadModalController', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {

    $scope.uploadReport = function() {
        var fileInput = document.getElementById('reportUploadFile').files[0];
        var file = new FormData();
        file.append('report-upload-file', fileInput);

        $http({
            method: 'POST',
            url: '/upload-report',
            transformRequest: false,
            headers: {'Content-Type': undefined},
            data: file
        }).
        success(function(data, status, headers, config) {
            if(data.success) {
                var obj = {
                    type : data.type,
                    data : data.reportData,
                    filename : fileInput.name
                };

                $rootScope.$broadcast('start-report-upload', obj);
            }
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.error(status);
        });

        $scope.clearInput();
    };

    $scope.clearInput = function() {
        var form = document.getElementById('reportUploadForm');
        form.reset();
    };
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