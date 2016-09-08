var app = angular.module("app");
app.controller('MainCtrl', ['$scope','$location','MainServ','Flash','$window', function ($scope,$location,MainServ,Flash,$window) {
	$scope.submit = function (user) {
		//alert(JSON.stringify(user))
		MainServ.login(user).then(function (response) {
			$window.localStorage.setItem('token', response.data.token);
			$scope.logged = true;
			$location.path('/dispensa')
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})
	}
}])