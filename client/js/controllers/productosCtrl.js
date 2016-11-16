var app = angular.module('app');

app.controller('ProductosCtrl', ['$scope','$location','ProductosServ','Flash','ConfigServ','config', function ($scope,$location,ProductosServ,Flash,ConfigServ,config) {
	if (!$scope.checkLogin()){
		$location.path("/");
	} else{
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
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

		//$scope.ambitos = config.ambitos;
	}
	
	$scope.seleccionTipo = function (tipo) {
		$scope.tipo = tipo;
	}
	//add producto
	$scope.addProducto = function (producto) {
		for(var t in $scope.tipos){
			if (producto.tipo == $scope.tipos[t]._id) {
				producto.tipo = $scope.tipos[t]
			}
		}
		for(var s in $scope.subtipos){
			if (producto.subtipo == $scope.subtipos[s]._id) {
				producto.subtipo = $scope.subtipos[s]
			}
		}
		if (producto.variedad != undefined) {
			for(var v in $scope.variedades){
				if (producto.variedad == $scope.variedades[v]._id) {
					producto.variedad = $scope.variedades[v]
				}
			}
		}
		ProductosServ.addProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido guardado correctamente';
	        Flash.create('success', message);
	        $location.path('/productos')
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        Flash.create('danger', message);
		})
	}
	//update producto
	$scope.updateProducto = function (producto) {
		ProductosServ.updateProducto(producto).then(function (response) {
	        var message = '<strong>HECHO!!!</strong> El producto ha sido modificado correctamente';
	        Flash.create('success', message);
	        $location.path('/productos')
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        Flash.create('danger', message);
		})
	}
	//delete producto
	$scope.deleteProducto = function (producto) {
		if (confirm("Seguro que quieres borrar el usuario??")) {
			ProductosServ.deleteProducto(producto).then(function (response) {
				var message = '<strong>HECHO!!!</strong> El producto ha sido borrado correctamente';
	        	Flash.create('success', message);
	        	$scope.productos.splice($scope.productos.indexOf(producto), 1);
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        	Flash.create('danger', message);
			})
		}
	}

	//get productoseleccionado to update
	if (!$scope.productoSeleccionado) {
		$scope.productoSeleccionado = ProductosServ.getProducto();
	}
	//set producto seleccionado
	$scope.seleccionProductoUpdate = function (producto) {
		ProductosServ.setProducto(producto);
		$location.path('/productos/updateProducto')
	}

	$scope.stock = function (producto) {
		return producto.stock[producto.stock.length-1].cantidad
	}

	$scope.bajaProducto = function (producto) {
		ProductosServ.bajaProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido dado de baja correctamente';
        	Flash.create('success', message);
        	for(var i in $scope.productos){
        		if ($scope.productos[i]._id == producto._id) {
        			$scope.productos[i].baja = true;
        		}
        	}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
        	Flash.create('danger', message);
		})
	}

	$scope.altaProducto = function (producto) {
		ProductosServ.altaProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido dado de alta correctamente';
        	Flash.create('success', message);
        	for(var i in $scope.productos){
        		if ($scope.productos[i]._id == producto._id) {
        			$scope.productos[i].baja = false;
        		}
        	}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
        	Flash.create('danger', message);
		})
	}
}])