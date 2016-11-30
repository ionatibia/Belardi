var app = angular.module('app');

app.controller('SociosCtrl', ['$scope','$location', 'SociosServ','Flash','config','ngDialog',function ($scope,$location,SociosServ,Flash,config,ngDialog) {
	
	//check login
	if (!$scope.checkLogin()){
		$location.path("/");
	} else{
		//get users types
		$scope.tiposUsuarios = config.tiposUsuarios;

		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
			//splice admin user
			for (var i = 0; i < $scope.socios.length; i++) {
				if($scope.socios[i].numero == 0){
					$scope.socios.splice($scope.socios.indexOf($scope.socios[i]),1)
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    Flash.create('danger', message);
		});
	}

	//table sort function
	$scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    
	//update socio
	$scope.updateSocio = function (socio) {
		if (!isNaN(socio.numero) || socio.numero.indexOf('baja') != -1) {
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

	//add socio
	$scope.addSocio = function (socio) {
		if (!isNaN(socio.numero)) {
			socio.correo = socio.correo.toLowerCase().trim()
			SociosServ.addSocio(socio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El usuario ha sido guardado correctamente';
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

	//baja socio
	$scope.bajaSocio = function (socio) {
		if (socio.numero == '0') {
			var message = '<strong>ERROR!!!</strong> no puedes dar de baja al socio administrador';
        	Flash.create('danger', message);
		}else{
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
	}

	//alta socio
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

	//check baja
	$scope.esBaja = function (socio) {
		if (isNaN(parseInt(socio))) {
			return true
		}else{
			return false
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
	
	//cancell update user
	$scope.cancelar = function () {
		$location.path('/socios')
	}

	//user data
	$scope.socioDatos = {};
	$scope.datosSocio = function (user) {
		$scope.socioDatos = user;
		ngDialog.open({template: 'datosSocioTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}

	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}

}])
//filtro locale date
.filter('toLocale', function () {
    return function (item) {
    	if (item != null) {
    		return new Date(item).toLocaleString()
    	}else{
    		return item
    	}
    };
});
