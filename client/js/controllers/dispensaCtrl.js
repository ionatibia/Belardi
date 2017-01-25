var app = angular.module("app");
app.controller('DispensaCtrl', ['$scope','$location','ProductosServ','SociosServ','$window','Flash','TicketServ','ConfigServ','config','ngDialog','progress', function ($scope,$location,ProductosServ,SociosServ,$window,Flash,TicketServ,ConfigServ,config,ngDialog,progress) {
	//check login
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
			//splice products with stock 0 & baja attr
			for (var i = 0; i < $scope.productos.length; i++) {
				if ($scope.productos[i].stock[$scope.productos[i].stock.length-1].cantidad == 0 || $scope.productos[i].baja) {
					$scope.productos.splice($scope.productos.indexOf($scope.productos[i]),1)
				}
			}

		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message)
		});

		$scope.socios = [];
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
			//splice users with not number & administrator
			for (var i = 0; i < $scope.socios.length; i++) {
				if($scope.socios[i].numero == 0){
					$scope.socios.splice($scope.socios.indexOf($scope.socios[i]),1)
				}
				if ($scope.socios.length != 0) {
					if(isNaN($scope.socios[i].numero)){
						$scope.socios.splice($scope.socios.indexOf($scope.socios[i]),1)
					}
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    Flash.create('danger', message)
		});

		//get types
		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message)
		})

		//get subtypes
		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message)
		})

		//get varietys
		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message)
		})

		//$scope.ambitos = config.ambitos;
	}


	//variables anadir 
	$scope.listaProductos = {};
	$scope.prodDispensados = false;
	var countProd = 0;
	//add products to provisional ticket
	$scope.anadir = function (ticket) {
		//recorrer array productos para buscar el producto completo
		for(var p in $scope.productos){
			if($scope.productos[p]._id == ticket.producto){
				//comprobar que hay stock
				if (ticket.cantidad <= $scope.stock($scope.productos[p])) {
					var existe = false;
					//recorrer lista de productos dispensados
					for(var i in $scope.listaProductos){
						//si existe, añadir cantidad
						if ($scope.listaProductos[i]._id == ticket.producto) {
							$scope.listaProductos[i].cantidad += ticket.cantidad;
							existe = true;
						}
					}
					//si no existe el producto en la lista, añadirlo
					if (!existe) {
						$scope.listaProductos[countProd] = $scope.productos[p]
						$scope.listaProductos[countProd].cantidad = ticket.cantidad
						countProd++
					}
				}else{
					var message = '<strong>ERROR!!!</strong> hay menos stock que la cantidad solicitada';
					Flash.create('danger', message);
				}
			}
		}
		$scope.ticket = angular.copy($scope.master);
		$scope.prodDispensados = true;
	}

	//End and send ticket
	$scope.ticketCompleto = {};
	$scope.finalizar = function (socio) {
		if ($scope.firma) {
			//canvas creado en funcion de pintar
			var url = canvas.toDataURL('image/jpeg');

			$scope.ticketCompleto = {'productos':$scope.listaProductos,'socio':socio,'firma':url,'neto':$scope.cuenta,'iva':$scope.cuentaIva}

			TicketServ.addTicket($scope.ticketCompleto).then(function (response) {
				var message = '<strong>HECHO!!!</strong> creado ticket para socio '+socio;
			    Flash.create('success', message);
				for(var s in $scope.productos){
					for(var p in response.data.productos){

						if($scope.productos[s]._id == response.data.productos[p]._id){
							$scope.productos[s].stock = response.data.productos[p].stock;
						}

						if ($scope.productos[s].stock[$scope.productos[s].stock.length-1].cantidad == 0 || $scope.productos[s].baja) {
							$scope.productos.splice($scope.productos.indexOf($scope.productos[s]),1)
						}
					}
				}

			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			    Flash.create('danger', message);
			})
			countProd = 0;
			$scope.prodDispensados = false;
			$scope.listaProductos = {};
			$scope.ticketCompleto = {};
			$scope.socio = '';
			$scope.acuerdo = false;
			$scope.paraEnviar = false;
			$scope.firma = false;
			resetCanvas()
			movimientos = []
		}else{
			var message = '<strong>ERROR!!!</strong> falta la firma!!!';
		    Flash.create('danger', message);
		}
	}

	//subtotal count
	$scope.cuenta = 0;
	$scope.subtotal = function () {
		var cuenta = 0;
		for(var p in $scope.listaProductos){
			var precioBruto = $scope.listaProductos[p].precio * $scope.listaProductos[p].cantidad
			for(var s in $scope.socios){
				if ($scope.socios[s].numero == $scope.socio && $scope.socios[s].tipo == 'Terapeutico') {
					precioBruto = precioBruto - ((precioBruto * config.descuentoTeraupeutico) / 100)
				}
			}
			var iva = (precioBruto * $scope.listaProductos[p].iva) / 100;
			var precioNeto = precioBruto - iva;
			//var precioNetoFixed = parseFloat(precioNeto.toFixed(2))//Math.round(precioNeto * 100) / 100//
			cuenta += precioNeto
		}
		$scope.cuenta = cuenta
		return cuenta
	}

	//iva count
	$scope.cuentaIva = 0;
	$scope.subtotalIva = function () {
		var cuentaIva = 0;
		for(var p in $scope.listaProductos){
			var precioBruto = $scope.listaProductos[p].precio * $scope.listaProductos[p].cantidad
			for(var s in $scope.socios){
				if ($scope.socios[s].numero == $scope.socio && $scope.socios[s].tipo == 'Terapeutico') {
					precioBruto = precioBruto - ((precioBruto * config.descuentoTeraupeutico) / 100)
				}
			}
			var iva = (precioBruto * $scope.listaProductos[p].iva) / 100;
			cuentaIva += iva
		}
		$scope.cuentaIva = cuentaIva;
		return cuentaIva;
	}

	//count ticket total
	$scope.totalTicket = function () {
		var total = 0;
		total = parseFloat($scope.cuenta) + parseFloat($scope.cuentaIva)
		$scope.total = total;
		return total
	}

	$scope.aDevolver = function (total) {
		if ($scope.entregado == undefined) {
			return 0
		}else if ($scope.entregado - total < 0) {
			return 0
		}else{
			return $scope.entregado - total
		}
	}

	//check product stock
	$scope.stock = function (producto) {
		return producto.stock[producto.stock.length-1].cantidad
	}

	//check client device
	$scope.esMovil = {
		Android: function(){
			return navigator.userAgent.match(/Android/i);
		},
		cualquiera: function() {
			return $scope.esMovil.Android()
		}
	}

	//control variables
	$scope.firma = false;
	$scope.acuerdo = false;
	$scope.paraEnviar = false;

	//set ticket to send
	$scope.preFinal = function () {
		$scope.paraEnviar = true;
	}

	//acuerdo modal
	$scope.modalAcuerdo = function () {
		ngDialog.open({template: 'acuerdoTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}

	$scope.descuento = config.descuentoTeraupeutico;
	$scope.terapeutico = function (numSocio) {
		for(var u in $scope.socios){
			if ($scope.socios[u].numero == numSocio) {
				if ($scope.socios[u].tipo == 'Terapeutico') {
					return true
				}else{
					return false
				}
			}
		}
	}

	//canvas variables
	var pulsado;
	var movimientos = new Array();
	var countPinta = 0;
	var canvasDiv = document.getElementById('lienzo');

	//start canvas
	initCanvas()

	//start canvas and set draw functions
	function initCanvas() {
		countPinta = 0;
		
		canvas = document.createElement('canvas');
		canvas.setAttribute('width', 400);
		canvas.setAttribute('height', 400);
		canvas.setAttribute('id', 'canvas');
		canvasDiv.appendChild(canvas);
		if(typeof G_vmlCanvasManager != 'undefined') {
		    canvas = G_vmlCanvasManager.initElement(canvas);
		}
		context = canvas.getContext("2d");
		if ($scope.esMovil.cualquiera()) {
			$('#canvas').bind('touchstart',function(event){
				var e = event.originalEvent;
				e.preventDefault();
				pulsado = true;
				movimientos.push([e.targetTouches[0].pageX - this.offsetLeft,e.targetTouches[0].pageY - this.offsetTop,false]);
				repinta();
			});

			$('#canvas').bind('touchmove',function(event){
				if(pulsado){
					movimientos.push([event.targetTouches[0].pageX - this.offsetLeft,event.targetTouches[0].pageY - this.offsetTop,true]);
			        repinta();
			      }
			});

			$('#canvas').bind('touchend',function(event){
				pulsado = false;
			});
		}else{
			$('#canvas').mousedown(function(e){
		      pulsado = true;
		      movimientos.push([e.pageX - this.offsetLeft,
		          e.pageY - this.offsetTop,
		          false]);
		      repinta();
		    });
		}
		
	    $('#canvas').mousemove(function(e){
	      if(pulsado){
	          movimientos.push([e.pageX - this.offsetLeft,
	              e.pageY - this.offsetTop,
	              true]);
	        repinta();
	      }
	    });
	 
	    $('#canvas').mouseup(function(e){
	      pulsado = false;
	    });
	 
	    $('#canvas').mouseleave(function(e){
	      pulsado = false;
	    });
	    repinta();
	}

	//reset canvas
	function resetCanvas() {
		canvas.width=canvas.width
	}

	//draw in canvas
    function repinta(){
    	countPinta++
    	if (countPinta > 1) {
    		$scope.firma = true;
    	}
		canvas.width = canvas.width; // Limpia el lienzo

		context.strokeStyle = "#0000a0";
		context.lineJoin = "round";
		context.lineWidth = 6;

		for(var i=0; i < movimientos.length; i++)
		{     
			context.beginPath();
			if(movimientos[i][2] && i){
				context.moveTo(movimientos[i-1][0], movimientos[i-1][1]);
			}else{
				context.moveTo(movimientos[i][0], movimientos[i][1]);
			}
			context.lineTo(movimientos[i][0], movimientos[i][1]);
			context.closePath();
			context.stroke();
		}
	}

}])//controller

