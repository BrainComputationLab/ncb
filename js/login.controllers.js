var app = require('./app');
var ncbApp = app.ncbApp;

ncbApp.controller('LoginCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.user = {
        email: undefined,
        password: undefined,
        rememberMe: false,
        firstName: undefined,
        lastName: undefined,
        institution: undefined
    };

    $scope.formVisible = true;
    $scope.showError = false;
    $scope.errorText = '';

    $scope.login = function() {
        if($scope.user.email !== undefined && $scope.user.password !== undefined) {
            console.log("Login");
            console.log($scope.user);

            var json = JSON.stringify($scope.user, null, '\t');
            $http.post('/login', json)
                .success(function(data, status, headers, config) {
                    if(data.success) {
                        location.reload();
                    }

                    else {
                        $scope.errorText = 'Incorrect email or password.';
                        $scope.showError = true;
                    }

                })
                .error(function(data, status, headers, config) {
                    console.error('Error on login');
                });
        }
    };

    $scope.register = function() {
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
        }
    };
}]);