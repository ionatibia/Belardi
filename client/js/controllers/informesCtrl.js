var app = angular.module('app');

app.controller('InformesCtrl', ['$scope', function ($scope) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}
}])