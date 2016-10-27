var app = angular.module('app');

app.controller('GraficosCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}
}])