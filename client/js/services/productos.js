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
        factory.updateStock = function (producto) {
            configAdd.url = endpoint+"/addStock/"+producto._id;
            configAdd.data = producto;
            return $http(configAdd)
        }
        factory.ajusteStock = function (producto) {
            configAdd.url = endpoint+"/ajusteStock/"+producto._id;
            configAdd.data = producto;
            return $http(configAdd)
        }

        factory.setProducto = function (producto) {
            factory.producto = producto;
        }

        factory.getProducto = function () {
            return factory.producto;
        }


        return factory;
 }]);