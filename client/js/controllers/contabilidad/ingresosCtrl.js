var app = angular.module("app");
app.controller('IngresosCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
	}
}])