var app = angular.module("app");
app.controller('ConfigCtrl', ['$scope','$location','Flash','$window','ConfigServ','ngDialog', function ($scope,$location,Flash,$window, ConfigServ,ngDialog) {
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
	}
	
	$scope.crearTipo = function () {
		ngDialog.open({template: 'typeTemplate.html', className: 'ngdialog-theme-default'});
	}

	$scope.cancelarModal = function () {
		closeThisDialog()
	}
}])