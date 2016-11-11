var app = angular.module("app");
app.controller('DispensaCtrl', ['$scope','$location','ProductosServ','SociosServ','$window','Flash','TicketServ','ConfigServ','config','ngDialog', function ($scope,$location,ProductosServ,SociosServ,$window,Flash,TicketServ,ConfigServ,config,ngDialog) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		$scope.socios = [];
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
			for (var i = 0; i < $scope.socios.length; i++) {
				if($scope.socios[i].numero == 0){
					$scope.socios.splice($scope.socios[i],1)
				}
				if ($scope.socios.length != 0) {
					if(isNaN($scope.socios[i].numero)){
						$scope.socios.splice($scope.socios[i],1)
					}
				}
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		});
		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})

		//$scope.ambitos = config.ambitos;
	}

	$scope.ticketCompleto = {};
	$scope.listaProductos = {};
	$scope.prodDispensados = false;
	var countProd = 0;
	$scope.anadir = function (ticket) {
		for(var p in $scope.productos){
			if($scope.productos[p]._id == ticket.producto){
				if (ticket.cantidad <= $scope.stock($scope.productos[p])) {
					$scope.listaProductos[countProd] = $scope.productos[p]
					$scope.listaProductos[countProd].cantidad = ticket.cantidad
					countProd++
				}else{
					var message = '<strong>ERROR!!!</strong> hay menos stock que la cantidad solicitada';
					Flash.create('danger', message);
				}
			}
		}
		$scope.ticket = angular.copy($scope.master);
		$scope.prodDispensados = true;
	}
	$scope.finalizar = function (socio) {
		if ($scope.firma) {
			//canvas creado en funcion de pintar
			var url = canvas.toDataURL('image/jpeg');

			$scope.ticketCompleto = {'productos':$scope.listaProductos,'socio':socio,'firma':url,'neto':$scope.cuenta,'iva':$scope.cuentaIva}

			TicketServ.addTicket($scope.ticketCompleto).then(function (response) {
				var message = '<strong>HECHO!!!</strong> creado ticket para socio '+socio;
			    Flash.create('success', message);

			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			    Flash.create('danger', message);
				console.log(JSON.stringify(err))
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
	$scope.cuenta = 0;
	$scope.subtotal = function () {
		var cuenta = 0;
		for(var p in $scope.listaProductos){
			var precioBruto = $scope.listaProductos[p].precio * $scope.listaProductos[p].cantidad
			var precioNeto = precioBruto / (($scope.listaProductos[p].iva/100)+1)
			//var precioNetoFixed = parseFloat(precioNeto.toFixed(2))//Math.round(precioNeto * 100) / 100//
			cuenta += precioNeto
		}
		$scope.cuenta = cuenta
		return cuenta
	}
	$scope.cuentaIva = 0;
	$scope.subtotalIva = function () {
		var cuentaIva = 0;
		for(var p in $scope.listaProductos){
			var precioBruto = $scope.listaProductos[p].precio * $scope.listaProductos[p].cantidad
			var precioNeto = precioBruto / (($scope.listaProductos[p].iva/100)+1);
			var iva = precioBruto - precioNeto
			cuentaIva += iva
		}
		//var cuentaRedondeada = cuentaIva.toFixed(2)//Math.round(cuentaIva * 100) / 100
		$scope.cuentaIva = cuentaIva;
		return cuentaIva;
	}

	$scope.totalTicket = function () {
		var total = 0;
		total = parseFloat($scope.cuenta) + parseFloat($scope.cuentaIva)
		//var totalRedondeado = total.toFixed(2)
		//var totalAjustado = Math.round(totalRedondeado)
		$scope.total = total;
		return total
	}

	$scope.stock = function (producto) {
		return producto.stock[producto.stock.length-1].cantidad
	}

	$scope.esMovil = {
		Android: function(){
			return navigator.userAgent.match(/Android/i);
		},
		cualquiera: function() {
			return $scope.esMovil.Android()
		}
	}

	$scope.firma = false;
	$scope.acuerdo = false;
	$scope.paraEnviar = false;
	$scope.preFinal = function () {
		$scope.paraEnviar = true;
	}

	$scope.modalAcuerdo = function () {
		ngDialog.open({template: 'acuerdoTemplate.html', className: 'ngdialog-theme-default', scope:$scope, overlay:false});
	}
	$scope.cancelarModal = function () {
		ngDialog.closeAll()
	}

	var pulsado;
	var movimientos = new Array();
	var countPinta = 0;
	var canvasDiv = document.getElementById('lienzo');

	initCanvas()

	function initCanvas() {
		countPinta = 0;
		
		canvas = document.createElement('canvas');
		canvas.setAttribute('width', 300);
		canvas.setAttribute('height', 300);
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
				console.log(this.offsetLeft)
				movimientos.push([e.targetTouches[0].pageX - this.offsetLeft,e.targetTouches[0].pageY - this.offsetTop,false]);
				console.log(movimientos)
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

	function resetCanvas() {
		//context.clearRect(0, 0, canvas.width, canvas.height);
		canvas.width=canvas.width
	}

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

