var app = angular.module("app");
app.controller('GastosCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
	}
}])