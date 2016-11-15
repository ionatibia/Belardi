var app = angular.module('app');

app.factory('IngresosServ', ['$http','config', function ($http,config) {
    var factory = {};
    var endpoint = config.apiUrl+"/ingresos";
    
    factory.anadirCuotaU = function (socio, cuota) {
        var config = {
            url: endpoint + '/cuotaUser',
            method: 'POST',
            data: {'socio':socio,'cuota':cuota}
        }
        return $http(config)
    }

    factory.anadirCuotaAll = function (cuota,socios) {
        var config = {
            url: endpoint + '/cuotaAll',
            method: 'POST',
            data: {'cuota':cuota,'socios':socios}
        }
        return $http(config)
    }

    return factory;
}])