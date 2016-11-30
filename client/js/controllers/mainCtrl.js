var app = angular.module("app");
app.controller('MainCtrl', ['$scope','$location','MainServ','Flash','$window', function ($scope,$location,MainServ,Flash,$window) {
	
	//submit function
	$scope.submit = function (user) {
		user.correo = user.correo.toLowerCase().trim()
		MainServ.login(user).then(function (response) {
			//save token into local storage
			$window.localStorage.setItem('token', response.data.token);
			$scope.logged = true;
			$location.path('/dispensa')
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    Flash.create('danger', message);
		})
	}
}])