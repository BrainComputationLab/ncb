var app = require('./app');
require('angular');
var ncbApp = app.ncbApp;

ncbApp.factory('UserAuthenticationService', ['$rootScope', '$http', function($rootScope, $http) {
    var userAuthenticationService = {};

    userAuthenticationService.addUser = function(username, password) {
        var json = angular.toJson({username: username, password: password}, null, "\t");
        $http.post('/add-user', json).
          success(function(data, status, headers, config) {
            console.log('Successfully added user: ' + username);
          }).
          error(function(data, status, headers, config) {
            console.log('Error adding user: ' + username);
          });
    };

    userAuthenticationService.login = function(username, password) {
        var json = angular.toJson({username: username, password: password}, null, "\t");
        $http.post('/login', json).
          success(function(data, status, headers, config) {
            console.log('Login Successful: ' + username);
          }).
          error(function(data, status, headers, config) {
            console.log('Login Error: ' + username);
          });
    };

});