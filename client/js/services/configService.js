var app = angular.module('app');

app.factory('ConfigServ', ['$http','config', function ($http,config) {
    var factory = {};
    var endpoint = config.apiUrl;

    factory.getAll = function (type) {
        var config = {
            url: endpoint + '/' + type,
            method: 'GET'
        }
        return $http(config)
    }

    factory.update = function (type,entity) {
        var config = {
            url: endpoint + '/' + type + '/' + entity._id,
            method: 'PUT',
            data: entity
        }
        return $http(config)        
    }
    
    factory.add = function (type, entity) {
        var config = {
            url: endpoint + '/' + type,
            method: 'POST',
            data: entity
        }
        return $http(config)
    }

    factory.delete = function (type, entity) {
        var config = {
            url: endpoint + '/' + type + '/' + entity._id,
            method: 'DELETE'
        }
        return $http(config)
    }

    factory.setEntity = function (entity) {
        factory.entity = entity
    }

    factory.getEntity = function () {
        return factory.entity
    }

    return factory;
}])