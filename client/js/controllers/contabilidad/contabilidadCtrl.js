var app = angular.module("app");
app.controller('ContabilidadCtrl', ['$scope','ContabilidadServ','ngDialog','Flash','config','SociosServ','$location', function ($scope,ContabilidadServ,ngDialog,Flash,config,SociosServ,$location) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		ContabilidadServ.getIngresos().then(function (response) {
			$scope.ingresos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ContabilidadServ.getGastos().then(function (response) {
			$scope.gastos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ContabilidadServ.getTotal().then(function (response) {
			$scope.totales = response.data;
			if ($scope.totales.length != 0) {
				$scope.total = $scope.totales[$scope.totales.length-1].cantidad
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
			for (var i = 0; i < $scope.socios.length; i++) {
				if($scope.socios[i].numero == 0){
					$scope.socios.splice($scope.socios[i],1)
				}
				if ($scope.socios.length != 0) {
					if(isNaN($scope.socios[i].numero)){
						$scope.socios.splice($scope.socios[i],1)
					}
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		$scope.tiposIngreso = config.tiposIngreso;
		$scope.tiposGasto = config.tiposGasto;
	}//else not logged

		

	/*================================
	=            INGRESOS            =
	================================*/
	$scope.modalIngreso = function () {
		ngDialog.open({template: 'ingresoTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}

	$scope.deleteIngreso = function (ingreso) {
		// body...
	}

	$scope.addIngreso = function (ingreso,socio) {
		var numSocio = undefined;
		if (ingreso.cantidad < 0) {
			var message = '<strong>ERROR!!!</strong> cantidad no puede ser negativa';
			Flash.create('danger', message);
		}else{
			if (ingreso.tipo == 'cuota') {
				var iva = (ingreso.cantidad * config.ivaCuotas) / 100;
				var neto = ingreso.cantidad - iva;
				ingreso.cantidad = neto;
				ingreso.iva = iva;
				numSocio = ingreso.socio;
				delete ingreso.socio;
			}
			if (ingreso.tipo == 'aportacion') {
				var retencion = (ingreso.cantidad * ingreso.retencion) /100;
				ingreso.cantidad = ingreso.cantidad - retencion;
				delete ingreso.retencion;
			}
			ContabilidadServ.addIngreso(ingreso,numSocio).then(function (response) {
				var message = '<strong>HECHO!!!</strong> añadido ingreso por '+response.data.cantidad+'€';
				Flash.create('success', message);
				$scope.ingresos.unshift(response.data)
				ngDialog.closeAll()
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
				ngDialog.closeAll()
			})

		}
	}
	
	/*=====  End of INGRESOS  ======*/

	/*==============================
	=            GASTOS            =
	==============================*/
	$scope.modalGasto = function () {
		ngDialog.open({template: 'gastoTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}

	$scope.deleteGasto = function (ingreso) {
		// body...
	}
	
	$scope.addGasto = function (gasto) {
		ContabilidadServ.addGasto(gasto).then(function (response) {
			if (response.data.iva) {
				var message = '<strong>HECHO!!!</strong> añadido gasto por '+(response.data.cantidad - response.data.iva)+'€';
			}else{
				var message = '<strong>HECHO!!!</strong> añadido gasto por '+response.data.cantidad+'€';
			}
			
			Flash.create('success', message);
			$scope.gastos.unshift(response.data)
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			ngDialog.closeAll()
		})
	}
	
	/*=====  End of GASTOS  ======*/
	
	/*===========================
	=            IVA            =
	===========================*/
	//config datepickers
	$.fn.datepicker.defaults.format = "dd/mm/yyyy";
	$.fn.datepicker.defaults.language = "es";
	$.fn.datepicker.defaults.todayHighlight = true;
	$.fn.datepicker.defaults.templates = {
		leftArrow: '<i class="glyphicon glyphicon-backward"></i>',
		rightArrow: '<i class="glyphicon glyphicon-forward"></i>'
	}

	$scope.cuentaIVA = function () {
		var start = $('#startDate').val()
		var end = $('#endDate').val()
		var startArray = start.split('/');
		var startDate = new Date(startArray[2],(parseInt(startArray[1])-1),startArray[0]);
		var endArray = end.split('/');
		var endDate = new Date(endArray[2],(parseInt(endArray[1])-1),endArray[0]);
		if (end == '' || end == undefined || end == null || start == '' || start == null || start == undefined) {
			var message = '<strong>INFO!!!</strong> falta alguna fecha';
		    Flash.create('info', message);
		}else if(startDate > endDate){
			var message = '<strong>ERROR!!!</strong> la fecha de inicio es mayor que la de fin';
		    Flash.create('danger', message);
		}else{
			var obj = {'startDate':start,'endDate':end}
			ContabilidadServ.cuentaIva(obj).then(function (response) {
				$scope.cuentaDeIva = response.data;
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}
	
	
	/*=====  End of IVA  ======*/
	

	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}

	$scope.fechaFormat = function (fecha) {
		return new Date(fecha).toLocaleString()
	}
	
}])