var app = angular.module('app');

    app.factory('MainServ', ['$http', function ($http) {
        var factory = {};
        var endpoint = 'http://localhost:8000/auth/login';


        factory.login = function (user) {
            var config = {
                url:endpoint,
                method:"POST",
                data:user
            }
            return $http(config);
        }

        return factory;
 }]);