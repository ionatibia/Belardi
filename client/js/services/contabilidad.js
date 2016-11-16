var app = angular.module('app');

app.factory('ContabilidadServ', ['$http','config', function ($http,config) {
    var factory = {};
    var endpoint = config.apiUrl;
    
    /*==============================
    =            CUOTAS            =
    ==============================*/
    factory.anadirCuotaU = function (socio, cuota) {
        var config = {
            url: endpoint + '/ingresos/cuotaUser',
            method: 'POST',
            data: {'socio':socio,'cuota':cuota}
        }
        return $http(config)
    }

    factory.anadirCuotaAll = function (cuota,socios) {
        var config = {
            url: endpoint + '/ingresos/cuotaAll',
            method: 'POST',
            data: {'cuota':cuota,'socios':socios}
        }
        return $http(config)
    }
    
    /*=====  End of CUOTAS  ======*/
    
    /*================================
    =            INGRESOS            =
    ================================*/
    factory.getIngresos = function () {
        var config = {
            url: endpoint + '/ingresos',
            method: 'GET'
        }
        return $http(config)
    }
    
    factory.addIngreso = function (ingreso,socio) {
        var config = {
            url: endpoint + '/ingresos/addIngreso',
            method: 'POST',
            data: {'ingreso':ingreso,'socio':socio}
        }
        return $http(config)
    }

    factory.deleteIngreso = function (ingreso) {
        var config = {
            url: endpoint + '/ingresos/'+ingreso._id,
            method: 'DELETE'
        }
        return $http(config)
    }
    /*=====  End of INGRESOS  ======*/

    /*================================
    =            GASTOS            =
    ================================*/
    factory.getGastos = function () {
        var config = {
            url: endpoint + '/gastos',
            method: 'GET'
        }
        return $http(config)
    }
    
    factory.addGasto = function (gasto) {
        var config = {
            url: endpoint + '/gastos/addGasto',
            method: 'POST',
            data: gasto
        }
        return $http(config)
    }

    factory.deleteGasto = function (gasto) {
        var config = {
            url: endpoint + '/gastos/'+gasto._id,
            method: 'DELETE'
        }
        return $http(config)
    }
    /*=====  End of GASTOS  ======*/
    
    /*===============================
    =            TOTALES            =
    ===============================*/
    factory.getTotal = function () {
        var config = {
            url: endpoint + '/total',
            method: 'GET'
        }
        return $http(config)
    }

    factory.addTotal = function (total) {
        var config = {
            url: endpoint + '/total',
            method: 'POST',
            data: total
        }
        return $http(config)
    }
    
    
    /*=====  End of TOTALES  ======*/

    factory.cuentaIva = function (obj) {
        var config = {
            url: endpoint + '/cuentaIva',
            method: 'POST',
            data: obj
        }
        return $http(config)
    }

    return factory;
}])