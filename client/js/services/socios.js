var app = angular.module('app');


    app.factory('SociosServ', ['$http','config', function ($http,config) {
    	var factory = {};
        var endpoint = config.apiUrl+'/auth/users';
        var endpoint2 = config.apiUrl+'/auth/signup';

        var configGet = {
            url: endpoint,
            method: 'GET',
        }

        var configPut = {
            method: "PUT",
        }

        var configAdd = {
            url:endpoint2,
            method:"POST",
        }

        var configDelete = {
            method:"DELETE",
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

        factory.bajaSocio = function (socio) {
            configAdd.url = endpoint+"/baja/"+socio._id;
            return $http(configAdd)
        }

        factory.altaSocio = function (socio,num) {
            configAdd.url = endpoint+"/alta/"+socio._id;
            configAdd.data = num;
            return $http(configAdd)
        }

        factory.setSocio = function (socio) {
            factory.socio = socio;
        }

        factory.getSocio = function () {
            return factory.socio;
        }

        return factory;
 }]);