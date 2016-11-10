var app = angular.module('app');

app.controller('InformesCtrl', ['$scope','$location', function ($scope,$location) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}

	//buttons
	$scope.tipoInforme = 'tri';

	$('#tri').addClass('btn-primary')

	$scope.cambio = function (tipo) {
		$('#'+$scope.tipoInforme).removeClass('btn-primary')
		$('#'+tipo).addClass('btn-primary')
		$scope.tipoInforme = tipo
	}

	//datepickers
	$scope.ensena = function () {
		console.log($('#startDate').val())
		console.log($('#endDate').val())
	}

	$('#sandbox-container input').datepicker({
	});

}])
