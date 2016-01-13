window.$ = window.jQuery = require('jquery');
require('jquery-ui');
require('bootstrap');
require("angular");
// initialize model page view
$().ready( function() {
    hidePages();
    $('#model').show();

    $("#addElementModal").on("show.bs.modal", function() {
        $("#elementType").change();
        $("#modalneuronName").val("");
        $("#modalcellGroupName").val("");
        $("#modalcellGroupNum").val("");
    });
});

// initialize main navigation
$().ready( function() {
    $('#mainNav a').click( function(e) {
        var target;
        $('#mainNav li').removeClass('active');
        $(this).parent().addClass('active');
        hidePages();
        target = $(this).attr('href');
        $(target).show();
        e.preventDefault();

        var $rootScope = angular.element(document.body).injector().get('$rootScope');
        $rootScope.$broadcast('page-changed');
        $rootScope.$apply();
    });
});

// function to hide all views
function hidePages() {
    $('#model').hide();
    $('#simulation').hide();
    $('#reports').hide();
    $('#database').hide();
    $('#vis').hide();
}

// Load the rest of the JS
require('./json');
require('./app.js');
require('./model.services.js');
require('./builder.controllers.js');
require('./sim.controllers.js');
require('./reports.controllers.js');
require('./login.controllers.js');
require('./vis.controllers.js');