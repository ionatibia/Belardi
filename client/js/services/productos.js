var app = angular.module('app');


    app.factory('ProductosServ', ['$http','config', function ($http,config) {
        var factory = {};
        var endpoint = config.apiUrl+'/products';

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



        factory.getAll = function () {
            return $http(configGet);
        }
        factory.updateProducto = function (producto) {
            configPut.url = endpoint+"/"+producto._id;
            configPut.data = producto;
            return $http(configPut)
        }
        factory.addProducto = function (producto) {
            configAdd.data = producto;
            return $http(configAdd);
        }
        factory.deleteProducto = function (producto) {
            configDelete.url = endpoint+"/"+producto._id;
            return $http(configDelete);
        }

        factory.setProducto = function (producto) {
            factory.producto = producto;
        }

        factory.getProducto = function () {
            return factory.producto;
        }
        //si hay que añadir mas tipos... verificar productosCtrl
        factory.tipos = [
            {"tipo":"dispensa"},
            {"tipo":"barra"},
            {"tipo":"parafernalia"}
        ];
        factory.subtipos = [
            {"nombre":"hierba", "tipo":"dispensa"},
            {"nombre":"extraccion", "tipo":"dispensa"},
            {"nombre":"bebida", "tipo":"barra"},
            {"nombre":"comida", "tipo":"barra"},
            {"nombre":"papel","tipo":"parafernalia"},
            {"nombre":"otros", "tipo":"parafernalia"}
        ];

        return factory;
 }]);