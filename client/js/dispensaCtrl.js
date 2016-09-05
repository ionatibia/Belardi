var app = angular.module("app");
app.controller('DispensaCtrl', ['$scope','$location','ProductosServ', function ($scope,$location,ProductosServ) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}
	$scope.productos = ProductosServ.productos;

}])//controller