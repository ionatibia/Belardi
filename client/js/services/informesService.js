var app = angular.module('app');

app.factory('InformesSrv', ['$http','config', function ($http,config) {
    var factory = {};
    var endpoint = config.apiUrl+'/informes';

    var configGet = {
        url: endpoint,
        method: 'GET',
    }

    var configPut = {
        method: "PUT",
    }

    var configAdd = {
        url:endpoint,
        method:"POST",
    }

    var configDelete = {
        method:"DELETE",
    }


    factory.getTicketReport = function (obj) {
    	configAdd.url = endpoint+"/tickets";
    	configAdd.data = obj;
    	return $http(configAdd)
    }
    factory.getTrimestralReport = function (obj) {
    	configAdd.url = endpoint+"/trimestral";
    	configAdd.data = obj;
    	return $http(configAdd)
    }
    factory.getEusfacReport = function (year) {
        configAdd.url = endpoint+"/eusfac";
        configAdd.data = {'ano':year}
        return $http(configAdd)
    }

    return factory;
 }]);