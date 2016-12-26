var app = angular.module('app');

app.controller('ProductosCtrl', ['$scope','$location','ProductosServ','Flash','ConfigServ','config', function ($scope,$location,ProductosServ,Flash,ConfigServ,config) {
	//check login
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
		//get all types
		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		//get all subtypes
		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		//get all varietys
		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		//$scope.ambitos = config.ambitos;
	}
	
	//table sort function
	$scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

	$scope.seleccionTipo = function (tipo) {
		$scope.tipo = tipo;
	}

	//add producto
	$scope.addProducto = function (producto) {
		//get type, subtype & variety objects
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
		//send data to save product
		ProductosServ.addProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido guardado correctamente';
	        Flash.create('success', message);
	        $scope.productos.push(producto)
	        $location.path('/productos')
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	        Flash.create('danger', message);
		})
	}

	//update producto
	$scope.updateProducto = function (producto) {
		//send data to update
		ProductosServ.updateProducto(producto).then(function (response) {
			//change object with new object
			for (var i = 0; i < $scope.productos.length; i++) {
				if($scope.productos[i]._id == response.data._id){
					$scope.productos[i] = response.data;
				}
			}
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
	        	for (var i = 0; i < $scope.productos.length; i++) {
					if($scope.productos[i]._id == response.data._id){
						$scope.productos.splice(i,1)
					}
				}
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

	//check product stock
	$scope.stock = function (producto) {
		return producto.stock[producto.stock.length-1].cantidad
	}

	//baja producto
	$scope.bajaProducto = function (producto) {
		ProductosServ.bajaProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido dado de baja correctamente';
        	Flash.create('success', message);
        	//update baja.producto in scope
        	for(var i in $scope.productos){
        		if ($scope.productos[i]._id == producto._id) {
        			$scope.productos[i].baja = response.data.baja;
        		}
        	}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
        	Flash.create('danger', message);
		})
	}

	//alta producto
	$scope.altaProducto = function (producto) {
		ProductosServ.altaProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido dado de alta correctamente';
        	Flash.create('success', message);
        	//update alta.producto in scope
        	for(var i in $scope.productos){
        		if ($scope.productos[i]._id == producto._id) {
        			$scope.productos[i].baja = response.data.baja;
        		}
        	}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
        	Flash.create('danger', message);
		})
	}

	$scope.cancelar = function () {
		$location.path('/productos')
	}

}])