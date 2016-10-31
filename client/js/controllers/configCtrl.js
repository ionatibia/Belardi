var app = angular.module("app");
app.controller('ConfigCtrl', ['$scope','$location','Flash','$window','ConfigServ','ngDialog','config', function ($scope,$location,Flash,$window, ConfigServ,ngDialog,config) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
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

	$scope.addType = function (type) {
		ConfigServ.add('type',type).then(function (response){
			var message = '<strong>HECHO!!!</strong> el tipo se ha guardado correctamente';
			Flash.create('success', message);
			$scope.tipos.push(type)
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.addSubType = function (subtype) {
		for(var i in $scope.tipos){
			if ($scope.tipos[i]._id == subtype.tipo) {
				subtype.tipo = $scope.tipos[i]
			}
		}
		console.log(subtype)
		ConfigServ.add('subtype',subtype).then(function (response){
			var message = '<strong>HECHO!!!</strong> el subtipo se ha guardado correctamente';
			Flash.create('success', message);
			$scope.subtipos.push(subtype)
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}
	$scope.addVariety = function (variety) {
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
		ConfigServ.add('variety',variety).then(function (response){
			var message = '<strong>HECHO!!!</strong> la variedad se ha guardado correctamente';
			Flash.create('success', message);
			$scope.variedades.push(variety)
			ngDialog.closeAll()
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}

	$scope.borrarTipo = function(tipo) {
		var found = false;
		for(var s in $scope.subtipos){
			if($scope.subtipos[s].tipo._id == tipo){
				found = true;
			}
		}
		if (!found) {
			if (confirm("Seguro que quieres borrar el tipo??")) {
				ConfigServ.delete('type',tipo).then(function (response) {
					var message = '<strong>HECHO!!!</strong> el tipo se ha borrado correctamente';
					Flash.create('success', message);
					$scope.tipos.splice($scope.tipos.indexOf(tipo,1))
				}, function(err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
					Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> hay subtipos que dependen de éste tipo';
			Flash.create('danger', message);
		}
		
	}
	$scope.borrarSubtipo = function(subtipo) {
		var found = false;
		for(var s in $scope.variedades){
			if ($scope.variedades[s].subtipo._id == subtipo) {
				found = true;
			}
		}
		if (!found) {
			if (confirm("Seguro que quieres borrar el subtipo??")) {
				ConfigServ.delete('subtype',subtipo).then(function (response) {
					var message = '<strong>HECHO!!!</strong> el subtipo se ha borrado correctamente';
					Flash.create('success', message);
					$scope.subtipos.splice($scope.subtipos.indexOf(subtipo,1))
				}, function(err) {
					var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
					Flash.create('danger', message);
				})
			}
		}else{
			var message = '<strong>ERROR!!!</strong> hay variedades que dependen de éste subtipo';
			Flash.create('danger', message);
		}
	}
	$scope.borrarVariedad = function(variedad) {
		if (confirm("Seguro que quieres borrar la variedad??")) {
			ConfigServ.delete('variety',variedad).then(function (response) {
				var message = '<strong>HECHO!!!</strong> la variedad se ha borrado correctamente';
				Flash.create('success', message);
				$scope.variedades.splice($scope.variedades.indexOf(variedad,1))
			}, function(err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}

	$scope.updateType = function (tipo) {
		ConfigServ.update('type',tipo).then(function (response){
			var message = '<strong>HECHO!!!</strong> el tipo se ha modificado correctamente';
			Flash.create('success', message);
			ngDialog.closeAll()
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
		ngDialog.open({template: 'typeTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.crearSubtipo = function () {
		ngDialog.open({template: 'subtypeTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.crearVariedad = function () {
		ngDialog.open({template: 'varietyTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}

	$scope.updateTipo = function (tipo) {
		$scope.tipoSeleccionado = tipo;
		ngDialog.open({template: 'typeTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.updateSubtipo = function (subtipo) {
		$scope.subtypeSeleccionado = subtipo;
		ngDialog.open({template: 'subtypeTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.updateVariedad = function (variedad) {
		console.log(variedad)
		$scope.varietySeleccionado = variedad;
		ngDialog.open({template: 'varietyTemplateUpdate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}

	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}
}])