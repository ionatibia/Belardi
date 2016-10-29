var app = angular.module("app");
app.controller('ConfigCtrl', ['$scope','$location','Flash','$window', function ($scope,$location,Flash,$window) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
	}
}])