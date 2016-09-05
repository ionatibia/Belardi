var app = angular.module('app');


    app.factory('ProductosServ', ['$http', function ($http) {
        var factory = {};
        var endpoint = 'http://localhost:8000/products';

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
            url:endpoint,
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
            {"tipo":"barra"}
        ];
        factory.subtipos = [
            {"dispensa":"hierba"},
            {"dispensa":"extraccion"},
            {"barra":"bebida"},
            {"barra":"comida"}
        ];

        return factory;
 }]);