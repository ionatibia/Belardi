var app = angular.module('app');

app.controller('ProductosCtrl', ['$scope','$location','ProductosServ','Flash', function ($scope,$location,ProductosServ,Flash) {
	if (!$scope.checkLogin()){
		$location.path("/");
	} else{
		tipos();
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

	}

	function tipos() {
		//tipos y subtipos
		$scope.tipos = ProductosServ.tipos;
		$scope.subtipos = ProductosServ.subtipos;
		$scope.subtiposDispensa = [];
		$scope.subtiposBarra = []
		for (var i = 0; i < $scope.subtipos.length; i++) {
			if($scope.subtipos[i].dispensa){
				$scope.subtiposDispensa.push($scope.subtipos[i])
			}else {
				$scope.subtiposBarra.push($scope.subtipos[i])
			}
		}
	}
	
	$scope.seleccionTipo = function (tipo) {
		$scope.tipo = tipo;
	}
	//add producto
	$scope.addProducto = function (producto) {
		ProductosServ.addProducto(producto).then(function (response) {
			var message = '<strong>HECHO!!!</strong> El producto ha sido guardado correctamente';
	        Flash.create('success', message);
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
	        Flash.create('danger', message);
		})
	}
	//update producto
	$scope.updateProducto = function (producto) {
		ProductosServ.updateProducto(producto).then(function (response) {
	        var message = '<strong>HECHO!!!</strong> El producto ha sido modificado correctamente';
	        Flash.create('success', message);
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
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
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
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
}])