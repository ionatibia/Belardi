angular.module('app',["ngRoute","ngFlash"])
	//Routes
	.config(function($routeProvider,$httpProvider) {
	    $routeProvider
	    .when("/", {
	        templateUrl: "../views/main.html",
	        controller: 'MainCtrl'
	    })
	    .when("/dispensa", {
	        templateUrl: "../views/tickets/dispensa.html",
	        controller: 'DispensaCtrl' 
	    })
	    .when('/socios', {
	    	templateUrl: '../views/socios/socios.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/socios/addSocio', {
	    	templateUrl: '../views/socios/addSocio.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/socios/updateSocio', {
	    	templateUrl: '../views/socios/updateSocio.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/productos', {
	    	templateUrl: '../views/productos/productos.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/productos/addProducto', {
	    	templateUrl: '../views/productos/addProducto.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/productos/updateProducto', {
	    	templateUrl: '../views/productos/updateProducto.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/informes', {
	    	templateUrl: '../views/informes.html',
	    	controller: 'InformesCtrl'
	    })
	    .when('/graficos', {
	    	templateUrl: '../views/graficos.html',
	    	controller: 'GraficosCtrl'
	    })
	    .otherwise({ redirectTo: '/' });

	    $httpProvider.interceptors.push('HeadersInterceptor');
	})
	//Controller
	.controller('AppCtrl', ['$scope','$location','$window', function ($scope,$location,$window) {
		//Active links
		$scope.isActive = function (viewLocation) { 
        	return viewLocation === $location.path();
    	};

    	//Login comprobation
		$scope.checkLogin = function () {
			if ($window.localStorage.getItem('token')) {
				return true;
			} else {
				return false;
			}
		}//check login
	}])//AppCtrl controller
	.factory("HeadersInterceptor", function($window){
	      var request = function request(config){
	          config.headers["X-ACCESS-TOKEN"] = $window.localStorage.getItem('token');
	          return config;
	      };

	      return {
	          request: request
	      };
	});