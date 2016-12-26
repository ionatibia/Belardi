var app = angular.module("app");
app.controller('AlmacenCtrl', ['$scope','ProductosServ','ConfigServ','config','Flash','$location', function ($scope,ProductosServ,ConfigServ,config,Flash,$location) {
	//check login
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		//get all products
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
			//splice products with baja attr
			for (var i = 0; i < $scope.productos.length; i++) {
				if ($scope.productos[i].baja) {
					$scope.productos.splice($scope.productos.indexOf($scope.productos[i]),1)
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
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

	$scope.showFilter = false;

	$scope.updateStock = function (prod) {
		var obj = {}
		if (prod != undefined && prod.cantidad != undefined) {
			//create obj to send
			for(var p in $scope.productos){
				if ($scope.productos[p]._id = prod.producto) {
					obj = $scope.productos[p];
					obj.cantidad = prod.cantidad
				}
			}
			//send obj to update
			ProductosServ.updateStock(obj).then(function (response) {
				var message = '<strong>HECHO!!!</strong> stock del producto '+response.data.nombre+' actualizado';
				Flash.create('success', message);
				//change old data for new
				for(var p in $scope.productos){
					if ($scope.productos[p]._id = response.data._id) {
						$scope.productos[p].stock = response.data.stock;
					}
				}
				//clean form
				$scope.producto = {}
				$scope.producto = angular.copy($scope.master);
				$location.path('/productos')
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}
	}

	$scope.ajusteStock = function (prod) {
		var obj = {}
		if (prod != undefined && prod.cantidad != undefined) {
			//create obj to send
			for(var p in $scope.productos){
				if ($scope.productos[p]._id = prod.producto) {
					obj = $scope.productos[p];
					obj.cantidad = prod.cantidad
					obj.observaciones = prod.observaciones
				}
			}
			//send obj
			ProductosServ.ajusteStock(obj).then(function (response) {
				var message = '<strong>HECHO!!!</strong> stock del producto '+response.data.nombre+' ajustado';
				Flash.create('success', message);
				for(var p in $scope.productos){
					if ($scope.productos[p]._id = response.data._id) {
						$scope.productos[p].stock = response.data.stock;
					}
				}
				//clean form
				$scope.productoAjuste = angular.copy($scope.master);
				$location.path('/productos')
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
				Flash.create('danger', message);
			})
		}	
	}

}])