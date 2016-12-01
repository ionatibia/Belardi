var app = angular.module('app');

app.controller('GraficosCtrl', ['$scope','ProductosServ','SociosServ','ContabilidadServ','$location','ConfigServ','Flash', function ($scope,ProductosServ,SociosServ,ContabilidadServ,$location,ConfigServ,Flash) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}else{
		$scope.socios = [];
		//get all productos
		ProductosServ.getAll().then(function (response) {
			$scope.productos = response.data;
			for (var i = 0; i < $scope.productos.length; i++) {
				if ($scope.productos[i].baja) {
					$scope.productos.splice($scope.productos.indexOf($scope.productos[i]),1)
				}
			}
			$scope.stocks = [];
			for(var p in $scope.productos){
				for (var i = 0; i < $scope.productos[p].stock.length; i++) {
					$scope.stocks.push({'name':$scope.productos[p].nombre,'fecha':$scope.productos[p].stock[i].fecha,'cantidad':$scope.productos[p].stock[i].cantidad})
				}
			}

		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data.message);
		    Flash.create('danger', message)
		});
		//get all socios
		SociosServ.getAll().then(function (response) {
			$scope.socios = response.data;
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

		ContabilidadServ.getTotal().then(function (response) {
			$scope.totales = response.data;
			if ($scope.totales.length != 0) {
				$scope.total = $scope.totales[$scope.totales.length-1].cantidad
			}
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ContabilidadServ.getIngresos().then(function (response) {
			$scope.ingresos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})

		ContabilidadServ.getGastos().then(function (response) {
			$scope.gastos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		ConfigServ.getAll('type').then(function (response) {
			$scope.tipos = response.data;
		}, function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		ConfigServ.getAll('subtype').then(function (response) {
			$scope.subtipos = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
		ConfigServ.getAll('variety').then(function (response) {
			$scope.variedades = response.data;
		},function (err) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
			Flash.create('danger', message);
		})
	}//else

$scope.crear = function () {
	var data = $scope.stocks;
	var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var parseTime = d3.timeParse("%d-%b-%y");

	var x = d3.scaleTime()
	    .rangeRound([0, width]);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var line = d3.line()
	    .x(function(d) { return x(new Date(d.fecha)); })
	    .y(function(d) { return y(+d.cantidad); });

	/*d3.json(algo, function(d) {
		console.log(d)
	  d.fecha = parseTime(d.fecha);
	  d.cantidad = +d.cantidad;
	  return d;
	}, function(error, data) {
	  if (error) throw error;*/

	  x.domain(d3.extent(data, function(d) { console.log(new Date(d.fecha));return new Date(d.fecha); }));
	  y.domain(d3.extent(data, function(d) { return +d.cantidad; }));

	  g.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));

	  g.append("g")
	      .attr("class", "axis axis--y")
	      .call(d3.axisLeft(y))
	    .append("text")
	      .attr("fill", "#000")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", "0.71em")
	      .style("text-anchor", "end")
	      .text("Price ($)");

	  g.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);
	//});
}

   

	/*$scope.ensenaF = false;
	$scope.tipoG = 'stock'

	//config datepickers
	$.fn.datepicker.defaults.format = "dd/mm/yyyy";
	$.fn.datepicker.defaults.language = "es";
	$.fn.datepicker.defaults.todayHighlight = true;
	$.fn.datepicker.defaults.clearBtn = true;
	$.fn.datepicker.defaults.todayBtn = 'linked';
	$.fn.datepicker.defaults.templates = {
		leftArrow: '<i class="glyphicon glyphicon-backward"></i>',
		rightArrow: '<i class="glyphicon glyphicon-forward"></i>',
	}

	$scope.crearGrafico = function (datos) {
		console.log(datos)
		if($scope.tipoG == 'stock'){
			crearGraficoStock(datos.startDate,datos.endDate,datos.interval,datos.tipo,datos.subtipo,datos.variedad,datos.producto)
		}else if ($scope.tipoG == 'cont') {
			crearGraficoCont()
		}
	}
	
	function crearGraficoStock(startDate,endDate,interval,tipo,subtipo,variedad,producto) {

		//fechas
		var start = $('#startDate').val()
		var end = $('#endDate').val()
		var startArray = start.split('/');
		var endArray = end.split('/');
		////////
		//intervalo
		var intervalo = 0;
		if (interval == 'ano') {
			intervalo = 365 * 24 * 3600 * 1000;
		}else if (interval == 'mes') {
			intervalo = 30 * 24 * 3600 * 1000;
		}else{
			intervalo = 24 * 3600 * 1000;
		}
		///////////
		//Productos
		var productos = [];
		if(tipo != '' && tipo != undefined){
			for(var t in $scope.productos){
				if ($scope.productos[t].tipo._id == tipo) {
					productos.push($scope.productos[t])
				}
			}
		}
		if(subtipo != '' && subtipo != undefined){
			for(var s in $scope.productos){
				if ($scope.productos[s].subtipo._id == subtipo) {
					if (productos.indexOf($scope.productos[s]) == -1) {
						productos.push($scope.productos[s])
					}
				}else{
					for (var i = 0; i < productos.length; i++) {
						if($scope.productos[s]._id == productos[i]._id){
							productos.splice(i,1)
						}
					}
				}
			}
		}
		if (variedad != '' && variedad != undefined) {
			for(var v in $scope.productos){
				if ($scope.productos[v].variedad._id == variedad) {
					if (productos.indexOf($scope.productos[v]) == -1) {
						productos.push($scope.productos[v])
					}
				}else{
					for (var i = 0; i < productos.length; i++) {
						if($scope.productos[v]._id == productos[i]._id){
							productos.splice(i,1)
						}
					}
				}
			}
		}
		if (producto != '' && producto != undefined) {
			for(var p in $scope.productos){
				if ($scope.productos[p]._id == producto) {
					if (productos.indexOf($scope.productos[p]) == -1) {
						productos.push($scope.productos[p])
					}
				}else{
					for (var i = 0; i < productos.length; i++) {
						if($scope.productos[p]._id == productos[i]._id){
							productos.splice(i,1)
						}
					}
				}
			}
		}

		if (productos.length < 1) {
			if (tipo != undefined || subtipo != undefined || variedad != undefined) {
				if(tipo != '' || subtipo != '' || variedad != ''){
					var message = '<strong>UPS!!!</strong> no hay productos a mostrar';
					Flash.create('info', message);
				}else{
					productos = $scope.productos
				}
			}else{
				productos = $scope.productos
			}
		}
		//////////////
		var seriesProductos = [];
		for(var p in productos){
			var obj = {}
			obj.name = productos[p].nombre;
			obj.data = [];

			for(var st in productos[p].stock){

				var array = productos[p].stock[st].fecha.split('-')
				obj.data.push({'y':productos[p].stock[st].cantidad,'x':new Date(productos[p].stock[st].fecha)})

			}
			obj.marker={fillColor:'#659355'};
			obj.color = '#659355';
			seriesProductos.push(obj)
		}

		linearGraph(startArray,endArray,intervalo,seriesProductos);

	}

	function linearGraph(startArray,endArray,intervalo,series) {
		var ano = 0;

		if (startArray[2] == endArray[2]) {
			ano = startArray[2]
		}else{
			ano = startArray[2] + ' - ' + endArray[2];
		}

		Highcharts.setOptions({
		  global: {
		    useUTC: false
		  }
		});

		Highcharts.chart('gStockDiv', {
			chart: {
	            type: 'line'
	        },
	        title: {
	            text: 'Stock',
	            x: -20 //center
	        },
	        subtitle: {
	            text: 'Año: '+ano,
	            x: -20
	        },
	        xAxis: {
	        	type: 'datetime',
                tickInterval: intervalo,
                min: Date.UTC(startArray[2], startArray[1]-1, startArray[0]),
                max: Date.UTC(endArray[2], endArray[1]-1, endArray[0]),
             	startOnTick: true,
	        },
	        yAxis: {
	            title: {
	                text: 'Stock (gr)'
	            },
	            plotLines: [{
	                value: 0,
	                width: 1,
	                color: '#808080'
	            }]
	        },
	        tooltip: {
	            valueSuffix: 'gr',
	            useHTML: true,
                formatter: function() {
                    var d = new Date(this.x);
                    var s = '';
                    //console.log(this)
                    
                    $.each(this.points, function(i, point) {
                    	//console.log(point)
                    	s+='<b>'+Highcharts.dateFormat('%d - %b',  this.x)+'</b>'+point.series.colorIndex+'<br/>';
                        s += '<span style="color: '+point.series.colorIndex+';">\u25CF</span>'+point.series.name +': '+point.y;
                    });
                    return s;
                },
            	shared: true
	        },
	        legend: {
	            layout: 'vertical',
	            align: 'right',
	            verticalAlign: 'middle',
	            borderWidth: 0
	        },
	        plotOptions: {
	            series: {
	                color: '#FF0000'
	            }
	        },
	        series: series
	    });
	}*/
		
}])