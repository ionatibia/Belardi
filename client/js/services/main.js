var app = angular.module('app');

    app.factory('MainServ', ['$http','config', function ($http,config) {
        var factory = {};
        var endpoint = config.apiUrl+'/auth/login';

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