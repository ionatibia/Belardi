angular.module('app',["ngRoute","ngFlash","ngDialog","ngAnimate","ngProgress","angularUtils.directives.dirPagination"])
	
	//Routes
	.config(function($routeProvider,$httpProvider) {
	    $routeProvider
	    .when("/", {
	        templateUrl: "views/main.html",
	        controller: 'MainCtrl'
	    })
	    .when("/dispensa", {
	        templateUrl: "views/dispensa.html",
	        controller: 'DispensaCtrl' 
	    })
	    .when('/socios', {
	    	templateUrl: 'views/socios/socios.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/socios/addSocio', {
	    	templateUrl: 'views/socios/addSocio.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/socios/updateSocio', {
	    	templateUrl: 'views/socios/updateSocio.html',
	    	controller: 'SociosCtrl'
	    })
	    .when('/productos', {
	    	templateUrl: 'views/productos/productos.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/productos/addProducto', {
	    	templateUrl: 'views/productos/addProducto.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/productos/updateProducto', {
	    	templateUrl: 'views/productos/updateProducto.html',
	    	controller: 'ProductosCtrl'
	    })
	    .when('/informes', {
	    	templateUrl: 'views/informes.html',
	    	controller: 'InformesCtrl'
	    })
	    .when('/graficos', {
	    	templateUrl: 'views/graficos.html',
	    	controller: 'GraficosCtrl'
	    })
	    .when('/almacen', {
	    	templateUrl: 'views/almacen.html',
	    	controller: 'AlmacenCtrl'
	    })
	    .when('/contabilidad', {
	    	templateUrl: 'views/contabilidad.html',
	    	controller: 'ContabilidadCtrl'
	    })
	    .when('/config', {
	    	templateUrl: 'views/config.html',
	    	controller: 'ConfigCtrl'
	    })

	    .otherwise({ redirectTo: '/' });

	    //inject interceptors
	    $httpProvider.interceptors.push('HeadersInterceptor');
	    $httpProvider.interceptors.push('LoadingInterceptor');
	})

	//Controller
	.controller('AppCtrl', ['$scope','$location','$window','Flash', 'ngProgressFactory','$rootScope',function ($scope,$location,$window,Flash,ngProgressFactory,$rootScope) {
		//create ngProgress instance
		$rootScope.progressbar = ngProgressFactory.createInstance();
		$rootScope.progressbar.setHeight('5px');
		$rootScope.progressbar.setColor('DarkMagenta');

		//Active links
		$scope.isActive = function (viewLocation) {
			if ($location.path().indexOf(viewLocation) > -1) {
				return true
			}else{
				return false
			}
    	};

    	//Login comprobation
		$scope.checkLogin = function () {
			if ($window.localStorage.getItem('token')) {
				return true;
			} else {
				return false;
			}
		}//check login

		//logout function
		$scope.logout = function () {
			//clear local storage include token
			$window.localStorage.clear();
			var message = '<strong>Agur... </strong><i class="glyphicon glyphicon-grain"></i><i class="glyphicon glyphicon-grain"></i><i class="glyphicon glyphicon-grain"></i>&nbsp;<i class="glyphicon glyphicon-thumbs-up"></i>';
		    Flash.create('success', message);
			$location.path('/')
		}
	}])//AppCtrl controller

	//token interceptor
	.factory("HeadersInterceptor", function($window){
	      var request = function request(config){
	          config.headers["X-ACCESS-TOKEN"] = $window.localStorage.getItem('token');
	          return config;
	      };

	      return {
	          request: request
	      };
	})

	//loading bar interceptor
    .factory('LoadingInterceptor', function($q, $rootScope) {
		return {
			// optional method
			'request': function(config) {
				$rootScope.$broadcast("event:startProgress");
				return config;
			},

			// optional method
			'requestError': function(rejection) {
				$rootScope.$broadcast("event:endProgress");
				if (canRecover(rejection)) {
					return responseOrNewPromise
				}
				return $q.reject(rejection);
			},

			// optional method
			'response': function(response) {
				$rootScope.$broadcast("event:endProgress");
				return response;
			},

			// optional method
			'responseError': function(rejection) {
				$rootScope.$broadcast("event:endProgress");
				if (canRecover(rejection)) {
					return responseOrNewPromise
				}
				return $q.reject(rejection);
			}
  		};
	})//loading bar factory

    //app constants
	.constant('config', {
	    apiUrl: 'http://localhost:8000',
	    //apiUrl: 'http://192.168.0.5:8000',
	    //apiUrl: 'http://belardi.zapto.org:8000',
	    tiposUsuarios: ["Normal","Terapeutico"],
	    //ambitos: [{'nombre':"Barra"},{'nombre':"Dispensa"},{'nombre':'Otros'}],
	    descuentoTeraupeutico: 20,
	    tiposIngreso:['cuota','aportacion','otros'],
	    tiposGasto:['factura','nomina','otros'],
	    ivaCuotas:21
	})

	//loading bar function
	.service("progress", ["$rootScope", "ngProgress", function($rootScope, ngProgress){
		$rootScope.$on("event:endProgress", function(){
			$rootScope.progressbar.complete();
		});
		$rootScope.$on("event:startProgress", function(){
			$rootScope.progressbar.reset();
			$rootScope.progressbar.start();
		})
	}])