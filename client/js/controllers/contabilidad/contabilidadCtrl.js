var app = angular.module("app");
app.controller('ContabilidadCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
	}
}])