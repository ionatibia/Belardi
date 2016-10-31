var app = angular.module("app");
app.controller('DispensaCtrl', ['$scope','$location','ProductosServ','SociosServ','$window','Flash','TicketServ','ConfigServ','config', function ($scope,$location,ProductosServ,SociosServ,$window,Flash,TicketServ,ConfigServ,config) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
			for (var i = 0; i < $scope.socios.length; i++) {
				if($scope.socios[i].numero == 0){
					$scope.socios.splice($scope.socios[i],1)
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		$scope.ambitos = config.ambitos;
	}

	$scope.ticketCompleto = [];
	$scope.listaProductos = [];
	$scope.prodDispensados = false;
	$scope.anadir = function (ticket) {
		$scope.ticketCompleto.push(ticket);
		$scope.listaProductos.push(ticket)
		$scope.ticket = angular.copy($scope.master);
		$scope.prodDispensados = true;
	}
	$scope.finalizar = function (socio) {
		console.log($scope.ticketCompleto+" socio: "+socio)
		$scope.prodDispensados = false;
		TicketServ.addTicket($scope.ticketCompleto,socio).then(function (response) {
			console.log(response.data)
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})
		$scope.ticketCompleto = [];
	}

}])//controller