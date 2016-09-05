var app = angular.module('app');


    app.factory('SociosServ', ['$http', function ($http) {
    	var factory = {};
        var endpoint = 'http://localhost:8000/auth/users';
        var endpoint2 = 'http://localhost:8000/auth/signup';

        var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1N2NkMzE0NTQ4NGNmMDFhODAwYzY2ZWYiLCJpYXQiOjE0NzMwNjUzODMsImV4cCI6MTQ3MzE1MTc4M30.S6r5sh6r-Fx25VTjPIB1Ebnv_XhOodIXoeyPCtJaxgA";

        var configGet = {
            url: endpoint,
            method: 'GET',
            headers: {
                'X-ACCESS-TOKEN': token
            }
        }

        var configPut = {
            method: "PUT",
            headers: {
                'X-ACCESS-TOKEN': token
            }
        }

        var configAdd = {
            url:endpoint2,
            method:"POST",
            headers: {
                'X-ACCESS-TOKEN': token
            }
        }

        var configDelete = {
            method:"DELETE",
            headers: {
                'X-ACCESS-TOKEN': token
            }
        }



        factory.getAll = function () {
            return $http(configGet);
        }
        factory.updateSocio = function (socio) {
            configPut.url = endpoint+"/"+socio._id;
            configPut.data = socio;
            return $http(configPut)
        }
        factory.addSocio = function (socio) {
            configAdd.data = socio;
            return $http(configAdd);
        }
        factory.deleteSocio = function (socio) {
            configDelete.url = endpoint+"/"+socio._id;
            return $http(configDelete);
        }

        factory.setSocio = function (socio) {
            factory.socio = socio;
        }

        factory.getSocio = function () {
            return factory.socio;
        }

        return factory;
 }]);