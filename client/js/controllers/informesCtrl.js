var app = angular.module('app');

app.controller('InformesCtrl', ['$scope','$location','Flash','InformesSrv','config','$timeout', function ($scope,$location,Flash,InformesSrv,config,$timeout) {
	if (!$scope.checkLogin()){
		$location.path("/");
	}

	//buttons
	$scope.tipoInforme = 'tri';
	$('#tri').addClass('btn-primary')

	$scope.cambio = function (tipo) {
		$('#'+$scope.tipoInforme).removeClass('btn-primary')
		$('#'+tipo).addClass('btn-primary')
		$scope.tipoInforme = tipo
		if($scope.tipoInforme == 'eus'){

		}
	}

	/*==============================
	=            CONFIG            =
	==============================*/
	//config datepickers
	$.fn.datepicker.defaults.format = "dd/mm/yyyy";
	$.fn.datepicker.defaults.language = "es";
	$.fn.datepicker.defaults.todayHighlight = true;
	$.fn.datepicker.defaults.clearBtn = true;
	$.fn.datepicker.defaults.todayBtn = 'linked';
	$.fn.datepicker.defaults.templates = {
		leftArrow: '<i class="glyphicon glyphicon-backward" style="color:#5cb85c"></i>',
		rightArrow: '<i class="glyphicon glyphicon-forward" style="color:#5cb85c"></i>',
	}

	var date = new Date;
	var year = date.getFullYear() - 9;
	$scope.years = []
	for (var i = 0; i < 10; i++) {
		$scope.years.push(year+i)
	}
	
	
	/*=====  End of CONFIG  ======*/
	

	/*===============================
	=            TICKETS            =
	===============================*/

	//datepickers
	$scope.crearPdf = function (firm) {
		var start = $('#startDate').val()
		var end = $('#endDate').val()
		var startArray = start.split('/');
		var startDate = new Date(startArray[2],(parseInt(startArray[1])-1),startArray[0]);
		var endArray = end.split('/');
		var endDate = new Date(endArray[2],(parseInt(endArray[1])-1),endArray[0]);
		if (end == '' || end == undefined || end == null || start == '' || start == null || start == undefined) {
			var message = '<strong>INFO!!!</strong> falta alguna fecha';
		    Flash.create('info', message);
		}else if(startDate > endDate){
			var message = '<strong>ERROR!!!</strong> la fecha de inicio es mayor que la de fin';
		    Flash.create('danger', message);
		}else{
			var obj = {'startDate':start,'endDate':end}
			InformesSrv.getTicketReport(obj).then(function (response) {
				if (response.data.length < 1) {
					var message = '<strong>UPS!!!</strong> no hay datos';
		    		Flash.create('info', message);
				}else{
					if (firm) {
						var docDefinition = {
							header: { text: 'Resumen de Dispensa '+start+' a '+end, style: 'header', margin: [ 40, 10, 10, 20 ] },
							content: [
								{
									table: {
										headerRows: 1,
										widths: [ 'auto', 'auto', '*', 'auto','auto','auto' ],
										body: [
											[ {text:'Fecha',style:'titles',fillColor:'green'}, {text:'Socio',style:'titles',fillColor:'green'}, {text:'Dispensa',style:'titles',fillColor:'green'},{text:'Usuario',style:'titles',fillColor:'green'}, {text:'Total',style:'titles',fillColor:'green'}, {text:'Firma',style:'titles',fillColor:'green'} ],
										]
									}
								}
							],
							styles:{
								header:{
									fontSize:22,
									bold:true
								},
								titles:{
									alignment:'center',
								},
								body:{
									fontSize:10
								}
							}
						};
					}else{
						var docDefinition = {
							header: { text: 'Resumen de Dispensa '+start+' a '+end, style: 'header', margin: [ 40, 10, 10, 20 ] },
							content: [
								{
									table: {
										headerRows: 1,
										widths: [ 'auto', 'auto', '*', 'auto','auto' ],
										body: [
											[ {text:'Fecha',style:'title',fillColor:'green'}, {text:'Socio',style:'title',fillColor:'green'}, {text:'Dispensa',style:'title',fillColor:'green'},{text:'Usuario',style:'title',fillColor:'green'}, {text:'Total',style:'title',fillColor:'green'} ],
										]
									}
								}
							],
							styles:{
								header:{
									fontSize:22,
									bold:true
								},
								titles:{
									alignment:'center',
								},
								body:{
									fontSize:10
								}
							}
						};
					}

					var count = 0;
					for (var i = 0; i < response.data.length; i++) {
						var dispensa = '';
						for(var d in response.data[i].dispensa){
							dispensa += response.data[i].dispensa[d].producto.nombre+"  Cantidad:"+response.data[i].dispensa[d].cantidad+"\n";
						}
						
						var fecha = new Date(response.data[i].fecha).toLocaleString();
						var array = fecha.split(' ');
						var fechaHora = array[0]+'\n'+array[1]
						var socio = response.data[i].socio.numero;
						var usuario = response.data[i].usuario.numero;
						var total = (response.data[i].neto + response.data[i].iva).toFixed(2);
						
						var imagen = response.data[i].firmaUrl;

						if (firm) {
							if (count%2 == 0) {
								var texto = [{text: fechaHora, style:'body'},{text:socio,style:'body'},{text:dispensa,style:'body'},{text:usuario,style:'body'},{text:total,style:'body'},{image:imagen,width: 100}];
							}else{
								var texto = [{text: fechaHora, style:'body',fillColor:'yellow'},{text:socio,style:'body',fillColor:'yellow'},{text:dispensa,style:'body',fillColor:'yellow'},{text:usuario,style:'body',fillColor:'yellow'},{text:total,style:'body',fillColor:'yellow'},{image:imagen,width: 100}];
							}
						}else{
							if (count%2 == 0) {
								var texto = [{text: fechaHora, style:'body'},{text:socio,style:'body'},{text:dispensa,style:'body'},{text:usuario,style:'body'},{text:total,style:'body'}];
							}else{
								var texto = [{text: fechaHora, style:'body',fillColor:'yellow'},{text:socio,style:'body',fillColor:'yellow'},{text:dispensa,style:'body',fillColor:'yellow'},{text:usuario,style:'body',fillColor:'yellow'},{text:total,style:'body',fillColor:'yellow'}];
							}
						}
						
						count++;
						docDefinition.content[0].table.body.push(texto)
					}//for
					pdfMake.createPdf(docDefinition).download('Resumen_Dispensa'+array[0]+'.pdf');
				}//else data 0
			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    	Flash.create('danger', message);
			})
		}//else sin data
	}

	/*=====  End of TICKETS  ======*/

	/*==================================
	=            TRIMESTRAL            =
	==================================*/
	
	$scope.crearPdfTri = function () {
		var start = $('#startDateTri').val()
		var end = $('#endDateTri').val()
		if (end == '' || end == undefined || end == null || start == '' || start == null || start == undefined) {
			var message = '<strong>INFO!!!</strong> falta alguna fecha';
		    Flash.create('info', message);
		}else{
			var obj = {'startDate':start,'endDate':end}
			InformesSrv.getTrimestralReport(obj).then(function (response) {
				if (response.data.length < 1) {
					var message = '<strong>UPS!!!</strong> no hay datos';
		    		Flash.create('info', message);
				}else{
					var tickets = response.data.tickets;
					var cuotas = response.data.cuotas;

					for (var i = 0; i < tickets.length; i++) {
						var date = new Date(tickets[i].fecha);
						var dia = date.getDate();
						var mes = date.getMonth()+1
						var ano = date.getFullYear()
						var neto = tickets[i].neto;
						var iva = tickets[i].iva
						crearArray(dia,mes,ano,neto,iva,'dis');
					}

					for (var i = 0; i < cuotas.length; i++) {
						var date = new Date(cuotas[i].fecha);
						var dia = date.getDate();
						var mes = date.getMonth()+1;
						var ano = date.getFullYear();
						var neto = cuotas[i].cantidad;
						var iva = cuotas[i].iva;
						crearArray(dia,mes,ano,neto,iva,'cuota');
					}
				}

				var docDefinition = {
					header: { text: 'Resumen de Dispensa diaria '+start+' a '+end, style: 'header', margin: [ 30, 10, 10, 20 ] },
					content: [
						{
							table: {
								headerRows: 1,
								widths: [ '*', '*', '*', '*','*','*','*' ],
								body: [
									[ {text:'Fecha',style:'titles',fillColor:'green'}, {text:'Cuotas N',style:'titles',fillColor:'green'}, {text:'Cuotas I',style:'titles',fillColor:'green'},{text:'Cuotas T',style:'titles',fillColor:'green',bold:true}, {text:'Dispensa N',style:'titles',fillColor:'green'}, {text:'Dispensa I',style:'titles',fillColor:'green'}, {text:'Dispensa T',style:'titles',fillColor:'green',bold:true} ],
								]
							}
						}
					],
					styles:{
						header:{
							fontSize:22,
							bold:true
						},
						titles:{
							alignment:'center',
						},
						body:{
							fontSize:10
						}
					}
				};
				var count = 0;
				var totalNetoDis = 0;
				var totalIvaDis = 0;
				var totalDispensa = 0;
				var totalNetoCuo = 0;
				var totalIvaCuo = 0;
				var totalCuotas = 0;
				var totalDis = 0;
				var totalCuo = 0;
				for (var i = 0; i < triObj.length; i++) {
					totalNetoDis += triObj[i].netoDis;
					totalIvaDis += triObj[i].ivaDis;
					totalNetoCuo += triObj[i].netoCuo;
					totalIvaCuo += triObj[i].ivaCuo;
					totalDis = (triObj[i].netoDis + triObj[i].ivaDis).toFixed(2);
					totalCuo = (triObj[i].netoCuo + triObj[i].ivaCuo).toFixed(2);

					totalDispensa += parseFloat(totalDis);
					totalCuotas += parseFloat(totalCuo);
					if (count%2 == 0) {
						var texto = [{text:triObj[i].dia+"-"+triObj[i].mes+"-"+triObj[i].ano, style:'body'},{text:triObj[i].netoCuo.toFixed(2).toString(), style:'body'},{text:triObj[i].ivaCuo.toFixed(2).toString(),style:'body'},{text:totalCuo.toString(),style:'body',bold:true},{text:triObj[i].netoDis.toFixed(2).toString(),style:'body'},{text:triObj[i].ivaDis.toFixed(2).toString(),style:'body'},{text:totalDis.toString(),style:'body',bold:true}]
					}else{
						var texto = [{text:triObj[i].dia+"-"+triObj[i].mes+"-"+triObj[i].ano, style:'body',fillColor:'yellow'},{text:triObj[i].netoCuo.toFixed(2).toString(), style:'body',fillColor:'yellow'},{text:triObj[i].ivaCuo.toFixed(2).toString(),style:'body',fillColor:'yellow'},{text:totalCuo.toString(),style:'body',bold:true,fillColor:'yellow'},{text:triObj[i].netoDis.toFixed(2).toString(),style:'body',fillColor:'yellow'},{text:triObj[i].ivaDis.toFixed(2).toString(),style:'body',fillColor:'yellow'},{text:totalDis.toString(),style:'body',bold:true,fillColor:'yellow'}]
					}
					count++
					docDefinition.content[0].table.body.push(texto)
				}

				var textoTotal = [{text:'TOTALES',style:'body',bold:true},{text:totalNetoCuo.toFixed(2).toString(),style:'body',bold:true},{text:totalIvaCuo.toFixed(2).toString(),style:'body',bold:true},{text:totalCuotas.toFixed(2).toString(),style:'body',bold:true},{text:totalNetoDis.toFixed(2).toString(),style:'body',bold:true},{text:totalIvaDis.toFixed(2).toString(),style:'body',bold:true},{text:totalDispensa.toFixed(2).toString(),style:'body',bold:true}];
				docDefinition.content[0].table.body.push(textoTotal);
				pdfMake.createPdf(docDefinition).download('Resumen_Trimestral'+start+' a '+end+'.pdf');
				triObj = [];

			}, function (err) {
				var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
		    	Flash.create('danger', message);
			})
		}
	}

	var triObj = []
	function crearArray(dia,mes,ano,neto,iva,tipo) {
		var existe = false;
		for (var i = 0; i < triObj.length; i++) {
			if(triObj[i].dia == dia && triObj[i].mes == mes && triObj[i].ano == ano){
				if (tipo == 'dis') {
					triObj[i].netoDis += neto;
					triObj[i].ivaDis += iva;
					existe = true;
				}else{
					triObj[i].netoCuo += neto;
					triObj[i].ivaCuo += iva;
					existe = true;
				}
			}
		}
		if (!existe) {
			if (tipo == 'dis') {
				triObj.push({'dia':dia,'mes':mes,'ano':ano,'netoDis':neto,'ivaDis':iva,'netoCuo':0,'ivaCuo':0})
			}else{
				triObj.push({'dia':dia,'mes':mes,'ano':ano,'netoDis':0,'ivaDis':0,'netoCuo':neto,'ivaCuo':iva})
			}
			
		}
	}
	
	/*=====  End of TRIMESTRAL  ======*/

	/*==============================
	=            EUSFAC            =
	==============================*/
	$scope.crearPdfEus = function (ano) {
		
		InformesSrv.getEusfacReport(ano).then(function (response) {
			console.log(response.data)
		}, function (error) {
			var message = '<strong>ERROR!!!</strong> '+JSON.stringify(err.data);
	    	Flash.create('danger', message);
		})
		
	}
	
	
	/*=====  End of EUSFAC  ======*/
	
	
}])
