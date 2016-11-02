var app = angular.module("app");
app.controller('DispensaCtrl', ['$scope','$location','ProductosServ','SociosServ','$window','Flash','TicketServ','ConfigServ','config','ngDialog', function ($scope,$location,ProductosServ,SociosServ,$window,Flash,TicketServ,ConfigServ,config,ngDialog) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
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

		$scope.ambitos = config.ambitos;
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
		var  canvas = document.getElementById('lienzo');
		var context = canvas.getContext("2d");
		//var url = canvas.toDataURL('image/jpeg');
		//var image = new Image();
		//image.id = "pic"
		//image.src = canvas.toDataURL('image/jpeg');
		//document.getElementById('image_for_crop').appendChild(image);
		var url = canvas.toDataURL('image/jpeg');

		$scope.ticketCompleto = {'productos':$scope.listaProductos,'socio':socio,'firma':url}
		TicketServ.addTicket($scope.ticketCompleto).then(function (response) {
			console.log(response.data)
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message);
			console.log(JSON.stringify(err))
		})
		$scope.prodDispensados = false;
		$scope.listaProductos = {};
		$scope.ticketCompleto = {};
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
	if($scope.esMovil.cualquiera()){
		console.log("yes")
	}else{
		console.log("NO")
	}
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

}])//controller
.directive("drawing", function(){
  return {
    restrict: "A",
    link: function($scope, element){
      $scope.ctx = element[0].getContext('2d');

      // variable that decides if something should be drawn on mousemove
      var drawing = false;

      // the last coordinates before the current move
      var lastX;
      var lastY;

      element.bind('mousedown', function(event){
        if(event.offsetX!==undefined){
          lastX = event.offsetX;
          lastY = event.offsetY;
        } else { // Firefox compatibility
          lastX = event.layerX - event.currentTarget.offsetLeft;
          lastY = event.layerY - event.currentTarget.offsetTop;
        }

        // begins new line
        $scope.ctx.beginPath();

        drawing = true;
      });
      element.bind('mousemove', function(event){
        if(drawing){
          // get current mouse position
          if(event.offsetX!==undefined){
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          draw(lastX, lastY, currentX, currentY);

          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;
        }

      });
      element.bind('mouseup', function(event){
        // stop drawing
        drawing = false;
      });

      // canvas reset
      function reset(){
       element[0].width = element[0].width; 
      }

      function draw(lX, lY, cX, cY){
        // line from
        $scope.ctx.moveTo(lX,lY);
        // to
        $scope.ctx.lineTo(cX,cY);
        // color
        $scope.ctx.strokeStyle = "#4bf";
        // draw it
        $scope.ctx.stroke();
      }
    }
  };
});