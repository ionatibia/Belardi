var app = angular.module("app");
app.controller('ConfigCtrl', ['$scope','$location','Flash','$window','ConfigServ','ngDialog','config','SociosServ','ContabilidadServ','ProductosServ', function ($scope,$location,Flash,$window, ConfigServ,ngDialog,config,SociosServ,ContabilidadServ,ProductosServ) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message)
		});

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

		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
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

		//$scope.ambitos = config.ambitos;
	}

	$scope.addType = function (type) {
		ConfigServ.add('type',type).then(function (response){
			var message = '<strong>HECHO!!!</strong> el tipo se ha guardado correctamente';
			Flash.create('success', message);
			$scope.tipos.push(response.data)
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.addSubType = function (subtype) {
		var existe = false;
		for(var i in $scope.tipos){
			if ($scope.tipos[i]._id == subtype.tipo) {
				subtype.tipo = $scope.tipos[i]
			}
		}
		for(var e in $scope.subtipos){
			if ($scope.subtipos[e].nombre == subtype.nombre && $scope.subtipos[e].tipo.nombre == subtype.tipo.nombre) {
				existe = true;
			}
		}
		if (existe) {
			ngDialog.closeAll()
			var message = '<strong>ERROR!!!</strong> el subtipo ya existe';
			Flash.create('danger', message);
		}else{
			ConfigServ.add('subtype',subtype).then(function (response){
				var message = '<strong>HECHO!!!</strong> el subtipo se ha guardado correctamente';
				Flash.create('success', message);
				var obj = response.data;
				obj.tipo = subtype.tipo;
				$scope.subtipos.push(obj)
				ngDialog.closeAll()
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}
	$scope.addVariety = function (variety) {
		var existe = false
		for(var i in $scope.tipos){
			if ($scope.tipos[i]._id == variety.tipo) {
				variety.tipo = $scope.tipos[i]
			}
		}
		for(var i in $scope.subtipos){
			if ($scope.subtipos[i]._id == variety.subtipo) {
				variety.subtipo = $scope.subtipos[i]
			}
		}
		for(var e in $scope.variedades){
			if ($scope.variedades[e].nombre == variety.nombre && $scope.variedades[e].tipo.nombre == variety.tipo.nombre && $scope.variedades[e].subtipo.nombre == variety.subtipo.nombre) {
				existe = true;
			}	
		}
		if (existe) {
			ngDialog.closeAll()
			var message = '<strong>ERROR!!!</strong> la variedad ya existe';
			Flash.create('danger', message);
		}else{
			ConfigServ.add('variety',variety).then(function (response){
				var message = '<strong>HECHO!!!</strong> la variedad se ha guardado correctamente';
				Flash.create('success', message);
				var obj = response.data;
				obj.tipo = variety.tipo;
				obj.subtipo = variety.subtipo;
				$scope.variedades.push(obj)
				ngDialog.closeAll()
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}

	$scope.borrarTipo = function(tipo) {
		var found = false;
		var foundP = false;
		for(var s in $scope.subtipos){
			if($scope.subtipos[s].tipo._id == tipo){
				found = true;
			}
		}
		for( var p in $scope.productos){
			if($scope.productos[p].tipo._id == tipo){
				foundP = true;
			}
		}
		if (!found && !foundP) {
			if (confirm("Seguro que quieres borrar el tipo??")) {
				ConfigServ.delete('type',tipo).then(function (response) {
					var message = '<strong>HECHO!!!</strong> el tipo se ha borrado correctamente';
					Flash.create('success', message);
					for (var i = 0; i < $scope.tipos.length; i++) {
						if($scope.tipos[i]._id == tipo){
							$scope.tipos.splice(i,1)
						}
					}
				}, function(err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
					Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> hay subtipos o productos que dependen de éste tipo';
			Flash.create('danger', message);
		}
		
	}
	$scope.borrarSubtipo = function(subtipo) {
		var found = false;
		var foundP = false;
		for(var s in $scope.variedades){
			if ($scope.variedades[s].subtipo._id == subtipo) {
				found = true;
			}
		}
		for( var p in $scope.productos){
			if($scope.productos[p].subtipo._id == subtipo){
				foundP = true
			}
		}
		if (!found && !foundP) {
			if (confirm("Seguro que quieres borrar el subtipo??")) {
				ConfigServ.delete('subtype',subtipo).then(function (response) {
					var message = '<strong>HECHO!!!</strong> el subtipo se ha borrado correctamente';
					Flash.create('success', message);
					for (var i = 0; i < $scope.subtipos.length; i++) {
						if($scope.subtipos[i]._id == subtipo){
							$scope.subtipos.splice(i,1)
						}
					}
				}, function(err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
					Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> hay variedades o productos que dependen de éste subtipo';
			Flash.create('danger', message);
		}
	}
	$scope.borrarVariedad = function(variedad) {
		var foundP = false;
		for(var p in $scope.productos){
			if($scope.productos[p].variedad._id == variedad){
				foundP = true;
			}
		}
		if(!foundP){
			if (confirm("Seguro que quieres borrar la variedad??")) {
				ConfigServ.delete('variety',variedad).then(function (response) {
					var message = '<strong>HECHO!!!</strong> la variedad se ha borrado correctamente';
					Flash.create('success', message);
					for (var i = 0; i < $scope.variedades.length; i++) {
						if($scope.variedades[i]._id == variedad){
							$scope.variedades.splice(i,1)
						}
					}
				}, function(err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
					Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> hay productos que dependen de ésta variedad';
			Flash.create('danger', message);
		}
	}

	$scope.updateType = function (tipo) {
		ConfigServ.update('type',tipo).then(function (response){
			var message = '<strong>HECHO!!!</strong> el tipo se ha modificado correctamente';
			Flash.create('success', message);
			ngDialog.closeAll()
			for (var i = 0; i < $scope.tipos.length; i++) {
				if($scope.tipos[i]._id == tipo){
					$scope.tipos[i] = response.data
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.updateSubtype = function (subtipo) {
		for(var i in $scope.tipos){
			if ($scope.tipos[i]._id == subtipo.tipo) {
				subtipo.tipo = $scope.tipos[i]
			}
		}
		ConfigServ.update('subtype',subtipo).then(function (response){
			var message = '<strong>HECHO!!!</strong> el subtipo se ha modificado correctamente';
			Flash.create('success', message);
			for(var i in $scope.tipos){
				if ($scope.tipos[i]._id == response.data.tipo) {
					response.data.tipo = $scope.tipos[i]
				}
			}
			for(var i in $scope.subtipos){
				if ($scope.subtipos[i]._id == response.data._id) {
					$scope.subtipos[i] = response.data
				}
			}
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.updateVariety = function (variedad) {
		for(var i in $scope.tipos){
			if ($scope.tipos[i]._id == variedad.tipo) {
				variedad.tipo = $scope.tipos[i]
			}
		}
		for(var i in $scope.subtipos){
			if ($scope.subtipos[i]._id == variedad.subtipo) {
				variedad.subtipo = $scope.subtipos[i]
			}
		}
		ConfigServ.update('variety',variedad).then(function (response){
			var message = '<strong>HECHO!!!</strong> la variedad se ha modificado correctamente';
			Flash.create('success', message);
			for(var i in $scope.tipos){
				if ($scope.tipos[i]._id == response.data.tipo) {
					response.data.tipo = $scope.tipos[i]
				}
			}
			for(var i in $scope.subtipos){
				if ($scope.subtipos[i]._id == response.data.subtipo) {
					response.data.subtipo = $scope.subtipos[i]
				}
			}
			for(var i in $scope.variedades){
				if ($scope.variedades[i]._id == response.data._id) {
					$scope.variedades[i] = response.data
				}
			}
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	//MODALS
	$scope.crearTipo = function () {
		ngDialog.open({template: 'typeTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}
	$scope.crearSubtipo = function () {
		ngDialog.open({template: 'subtypeTemplate.html', className: 'ngdialog-theme-default', scope:$scope, ooverlay:true,showClose:true});
	}
	$scope.crearVariedad = function () {
		ngDialog.open({template: 'varietyTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}

	$scope.updateTipo = function (tipo) {
		$scope.tipoSeleccionado = tipo;
		ngDialog.open({template: 'typeTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}
	$scope.updateSubtipo = function (subtipo) {
		$scope.subtypeSeleccionado = subtipo;
		ngDialog.open({template: 'subtypeTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}
	$scope.updateVariedad = function (variedad) {
		$scope.varietySeleccionado = variedad;
		ngDialog.open({template: 'varietyTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:true,showClose:true});
	}

	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}

	/*==============================
	=            CUOTAS            =
	==============================*/
	$scope.anadirCuotaU = function (socio,cuota) {
		var user = {};
		for(var s in $scope.socios){
			if ($scope.socios[s].numero == socio) {
				user = $scope.socios[s]
			}
		}
		ContabilidadServ.anadirCuotaU(user,cuota).then(function (response) {
			var message = '<strong>HECHO!!!</strong> añadida cuota '+cuota+'€ al socio '+response.data.numero;
			Flash.create('success', message);
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.anadirCuotaAll = function (cuota) {
		var socios = []
		for(var s in $scope.socios){
			socios.push($scope.socios[s]._id)
		}
		if (socios.length == 0) {
			var message = '<strong>ERROR!!!</strong> No hay socios para añadir cuota';
			Flash.create('danger', message);
		}else{
			ContabilidadServ.anadirCuotaAll(cuota,socios).then(function (response) {
				var message = '<strong>HECHO!!!</strong> '+response.data;
				Flash.create('success', message);
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}
	
	/*=====  End of CUOTAS  ======*/

	/*=============================
	=            TOTAL            =
	=============================*/
	$scope.anadirTotal = function (total) {
		var obj = {'cantidad':total}
		ContabilidadServ.addTotal(obj).then(function (response) {
			var message = '<strong>HECHO!!!</strong> configurado total '+response.data.cantidad+'€';
			Flash.create('success', message);
			$scope.totales.push(response.data)
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	/*=====  End of TOTAL  ======*/
	
	
}])