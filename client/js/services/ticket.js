var app = angular.module('app');

app.factory('TicketServ', ['$http', function ($http) {
	var factory = {}
	var endpoint = 'http://localhost:8000/tickets';

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
    	return $http()
    }
    factory.addTicket = function (ticket,socio) {
    	configAdd.data = {'ticket':ticket,'socio':socio}
    	return $http(configAdd)
    }
    factory.readTicket = function (ticket) {
    	configGet.data = ticket._id;
    	return $http(configAdd)
    }

	return factory;
}])