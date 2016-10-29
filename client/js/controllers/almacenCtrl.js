var app = angular.module("app");
app.controller('AlmacenCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
	}
}])