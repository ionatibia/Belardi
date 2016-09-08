var app = angular.module('app');

app.controller('SociosCtrl', ['$scope','$location', 'SociosServ','Flash',function ($scope,$location,SociosServ,Flash) {
	if (!$scope.checkLogin()){
		$location.path("/");
	} else{
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
	}

	//update socio
	$scope.updateSocio = function (socio) {
		SociosServ.updateSocio(socio).then(function (response) {
	        var message = '<strong>HECHO!!!</strong> El usuario ha sido modificado correctamente';
	        Flash.create('success', message);
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
	        Flash.create('danger', message);
		})
	}
	//ad socio
	$scope.addSocio = function (socio) {
		SociosServ.addSocio(socio).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El usuario ha sido guardado correctamente';
	        Flash.create('success', message);
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
	        Flash.create('danger', message);
		})
	}
	//deleteSocio
	$scope.deleteSocio = function (socio) {
		if (confirm("Seguro que quieres borrar el usuario??")) {
			SociosServ.deleteSocio(socio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El usuario ha sido borrado correctamente';
	        	Flash.create('success', message);
	        	$scope.socios.splice($scope.socios.indexOf(socio), 1);
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
	        	Flash.create('danger', message);
			})
		}
	}
	//get socioseleccionado to update
	if (!$scope.socioSeleccionado) {
		$scope.socioSeleccionado = SociosServ.getSocio();
	}
	//set socio seleccionado
	$scope.seleccionSocioUpdate = function (socio) {
		SociosServ.setSocio(socio);
		$location.path('/socios/updateSocio')
	}

}])