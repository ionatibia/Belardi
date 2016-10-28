var app = angular.module('app');

app.controller('SociosCtrl', ['$scope','$location', 'SociosServ','Flash','config',function ($scope,$location,SociosServ,Flash,config) {
	if (!$scope.checkLogin()){
		$location.path("/");
	} else{
		$scope.tiposUsuarios = config.tiposUsuarios;
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
	}
	//update socio
	$scope.updateSocio = function (socio) {
		console.log(socio.numero.indexOf('baja'))
		if (!isNaN(socio.numero) || socio.numero.indexOf('baja') != -1) {
			console.log(socio)
			socio.correo = socio.correo.toLowerCase().trim()
			SociosServ.updateSocio(socio).then(function (response) {
		        var message = '<strong>HECHO!!!</strong> El usuario ha sido modificado correctamente';
		        Flash.create('success', message);
		        $location.path('/socios')
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		        Flash.create('danger', message);
			})
		}else{
			var message = '<strong>ERROR!!!</strong> El número de socio debe ser un número';
	        Flash.create('danger', message);
		}
	}
	//ad socio
	$scope.addSocio = function (socio) {
		if (!isNaN(socio.numero)) {
			socio.correo = socio.correo.toLowerCase().trim()
			SociosServ.addSocio(socio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El usuario ha sido guardado correctamente';
		        Flash.create('success', message);
		        $location.path('/socios')
			}, function (err) {
				console.log(err)
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		        Flash.create('danger', message);
			})
		}else{
			var message = '<strong>ERROR!!!</strong> El número de socio debe ser un número';
	        Flash.create('danger', message);
		}
	}
	//deleteSocio
	$scope.deleteSocio = function (socio) {
		if (confirm("Seguro que quieres borrar el socio??")) {
			SociosServ.deleteSocio(socio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El socio ha sido borrado correctamente';
	        	Flash.create('success', message);
	        	$scope.socios.splice($scope.socios.indexOf(socio), 1);
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        	Flash.create('danger', message);
			})
		}
	}

	$scope.bajaSocio = function (socio) {
		if (confirm("Seguro que quieres dar de baja al socio??")) {
			SociosServ.bajaSocio(socio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El socio ha sido dado de baja correctamente';
	        	Flash.create('success', message);
	        	socio.numero = response.data;
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        	Flash.create('danger', message);
			})
		}
	}

	$scope.altaSocio = function (socio) {
		var num = prompt("Introduce el número de socio: ");
		if (!isNaN(num)) {
			if (confirm("Seguro que quieres dar de alta al socio con el número "+num)) {
				SociosServ.altaSocio(socio,num).then(function (response) {
					var message = '<strong>HECHO!!!</strong> El socio '+response.data+' ha sido dado de alta correctamente';
	        		Flash.create('success', message);
	        		socio.numero = response.data;
				}, function (err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        		Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> El número de socio debe ser un número';
	        Flash.create('danger', message);
		}
	}

	$scope.esBaja = function (socio) {
		if (isNaN(parseInt(socio))) {
			return false
		}else{
			return true
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

}]);
