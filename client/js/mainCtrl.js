var app = angular.module("app");
app.controller('MainCtrl', ['$scope', function ($scope) {
	$scope.submit = function (user) {
		alert(JSON.stringify(user))
	}
}])