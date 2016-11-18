var app = angular.module("app");
app.controller('AlmacenCtrl', ['$scope','ProductosServ','ConfigServ','config','Flash','$location', function ($scope,ProductosServ,ConfigServ,config,Flash,$location) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
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

	$scope.updateStock = function (prod) {
		var obj = {}
		for(var p in $scope.productos){
			if ($scope.productos[p]._id = prod.producto) {
				obj = $scope.productos[p];
				obj.cantidad = prod.cantidad
			}
		}
		ProductosServ.updateStock(obj).then(function (response) {
			var message = '<strong>HECHO!!!</strong> stock del producto '+response.data.nombre+' actualizado';
			Flash.create('success', message);
			for(var p in $scope.productos){
				if ($scope.productos[p]._id = response.data._id) {
					$scope.productos[p].stock = response.data.stock;
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		$scope.producto = {}
		$scope.producto = angular.copy($scope.master);
		$location.path('/productos')
	}

	$scope.ajusteStock = function (prod) {
		var obj = {}
		for(var p in $scope.productos){
			if ($scope.productos[p]._id = prod.producto) {
				obj = $scope.productos[p];
				obj.cantidad = prod.cantidad
				obj.observaciones = prod.observaciones
			}
		}

		ProductosServ.ajusteStock(obj).then(function (response) {
			var message = '<strong>HECHO!!!</strong> stock del producto '+response.data.nombre+' ajustado';
			Flash.create('success', message);
			for(var p in $scope.productos){
				if ($scope.productos[p]._id = prod.producto) {
					$scope.productos[p].cantidad = prod.cantidad;
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		$scope.productoAjuste = angular.copy($scope.master);
		$location.path('/productos')
	}

}])