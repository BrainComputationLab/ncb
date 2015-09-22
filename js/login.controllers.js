var app = require('./app');
var ncbApp = app.ncbApp;

ncbApp.controller('LoginCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.user = {
        username: undefined,
        password: undefined,
        rememberMe: false,
        first_name: undefined,
        last_name: undefined,
        institution: undefined
    };

    $scope.formVisible = true;
    $scope.showError = false;
    $scope.errorText = '';

    $scope.login = function() {
        if($scope.user.username !== undefined && $scope.user.password !== undefined) {
            console.log("Login");
            console.log($scope.user);

            var json = JSON.stringify($scope.user, null, '\t');
            $http.post('/login', json)
                .success(function(data, status, headers, config) {
                    if(data.success) {
                        location.reload();
                    }

                    else {
                        $scope.errorText = 'Incorrect username or password.';
                        $scope.showError = true;
                    }

                })
                .error(function(data, status, headers, config) {
                    console.error('Error on login');
                });
        }
    };

    $scope.register = function() {
        console.log("Here!!!");
        var fieldsDefined = true;
        for(var key in $scope.user) {
            if($scope.user[key] === undefined) {
                fieldsDefined = false;
                break;
            }
        }

        if(fieldsDefined) {
            console.log("Register");
            console.log($scope.user);

            var json = JSON.stringify($scope.user, null, '\t');
            $http.post('/register', json)
                .success(function(data, status, headers, config) {
                    if(data.success) {
                        //location.reload();
                        console.log("Register success!");
                    }

                    else {
                        console.error("Register Error");
                        console.error(data.reason);
                    }

                })
                .error(function(data, status, headers, config) {
                    console.error('Error on register');
                });
        }
    };
}]);