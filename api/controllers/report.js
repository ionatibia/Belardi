'use strict';
/**
 *
 * Module dependencies
 *
 */
var mongoose = require('mongoose'),
	Ticket = mongoose.model('Ticket'),
	Ingreso = mongoose.model('Ingreso'),
	Product = mongoose.model('Product'),
	Gasto = mongoose.model('Gasto'),
	User = mongoose.model('User'),
	Subtype = mongoose.model('Subtype'),
	Type = mongoose.model('Type'),
	Variety = mongoose.model('Variety');
var Q = require('q');

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/informes.log' })
    ]
});

exports.ticketReport = function (req,res) {
	if (!req.body.startDate || !req.body.endDate) {
		return res
			.status(400)
			.send("Faltan parametros")
	}

	var startArray = req.body.startDate.split('/');
	var startDate = new Date(startArray[2],(parseInt(startArray[1])-1),startArray[0])

	var endArray = req.body.endDate.split('/');
	var endDate = new Date(endArray[2],(parseInt(endArray[1])-1),endArray[0]);

	Ticket.find({fecha:{$gte: startDate, $lte: endDate}}).populate('dispensa.producto').populate('socio').populate('usuario').exec(function (err,data) {
		if (err) {
			return res
				.status(400)
				.send("Error buscando tickets para informe "+err)
		}else{
			return res
				.status(200)
				.send(data)
		}
	})
}

exports.trimestralReport = function (req,res) {
	if (!req.body.startDate || !req.body.endDate) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var startArray = req.body.startDate.split('/');
	var startDate = new Date(startArray[2],(parseInt(startArray[1])-1),startArray[0])

	var endArray = req.body.endDate.split('/');
	var endDate = new Date(endArray[2],(parseInt(endArray[1])-1),endArray[0]);

	var promises = [];
	var tickets = [];
	var cuotas = [];

	var promiseTickets = Ticket.find({fecha:{$gte: startDate, $lte: endDate}}).exec(function (err,data) {
		if (err) {
			return res
				.status(400)
				.send("Error buscando tickets para informe "+err)
		}else{
			tickets = data;
		}
	})
	promises.push(promiseTickets)
	
	var promiseCuotas = Ingreso.find({fecha:{$gte: startDate, $lte: endDate}, tipo:'cuota'}).exec(function (err,data) {
		if (err) {
			return res
				.status(400)
				.send("Error buscando tickets para informe "+err)
		}else{
			cuotas = data;
		}
	});
	promises.push(promiseCuotas)

	Q.all(promises).then(function (response) {
		var obj = {'tickets':tickets,'cuotas':cuotas};
		return res
			.status(200)
			.send(obj)
	}, function (err) {
		return res
			.status(400)
			.send("Error buscando tickets/cuotas: "+err);
	})
}

exports.eusfacReport = function (req,res) {
	var promises = [];
	var productos = [];
	var tickets = [];
	var ingresos = [];
	var gastos = [];
	var bajas = 0;
	var altas = 0;
	var types = [];
	var subtypes = [];
	var varieties = [];
	var ano = req.body.ano;
	var start = new Date(ano,0,1);
	var end = new Date(ano,11,31,23,59);
	console.log(ano+"    "+start+"    "+end)

	var productPromise = Product.find().populate('tipo','nombre').populate('subtipo','nombre').populate('variedad','nombre').exec(function (err, products) {
		if (err) {
			logger.error("Error buscando productos")
			return res
				.status(400)
				.send("Error buscando productos: "+err.errmsg);
		} else {
			productos = products
			
		}
	});

	promises.push(productPromise);

	var ticketPromise = Ticket.find({"fecha":{$gte:start,$lte:end}}).populate('dispensa').populate('dispensa.producto').exec(function (err,ticketsArray) {
		if (err) {
			logger.error("Error buscando tickets")
			return res
				.status(400)
				.send("Error buscando tickets: "+err.errmsg);
		}else{
			tickets = ticketsArray
		}
	});

	promises.push(ticketPromise);

	var typePromise = Type.find().exec(function (err,typeArray) {
		if(err){
			logger.error("Error buscando tipos")
			return res
				.status(400)
				.send(err.errmsg)
		}else{
			types = typeArray;
		}
    });

	promises.push(typePromise)

    var subtypePromise = Subtype.find().exec(function (err,subtypeArray) {
        if(err){
            logger.error("Error buscando subtipos")
            return res
                .status(400)
                .send(err.errmsg)
        }else{
            subtypes = subtypeArray;
        }
    });

    promises.push(subtypePromise)

    var varietyPromise = Variety.find().exec(function (err,varietyArray) {
        if(err){
            logger.error("Error buscando variedades")
            return res
                .status(400)
                .send(err.errmsg)
        }else{
            varieties = varietyArray;
        }
    });

    promises.push(varietyPromise)

	var ingresosPromise = Ingreso.find({"fecha":{$gte:start,$lte:end}}).exec(function (err,ingresosArray) {
		if(err){
			logger.error("Error buscando ingresos");
			return res
				.status(400)
				.send(err.errmsg)
		}else{
			ingresos = ingresosArray;
		}
    })

	promises.push(ingresosPromise);

	var gastosPromise = Gasto.find({"fecha":{$gte:start,$lte:end}}).exec(function (err,gastosArray) {
		if(err){
			logger.error("Error buscando gastos");
			return res
				.status(400)
				.send(err.errmsg)
		}else{
			gastos = gastosArray;
		}
    });

	promises.push(gastosPromise);

	var userBajaPromise = User.find({"fecha_baja":{$gte:start,$lte:end}}).exec(function (err,usersBajaArray) {
		if(err){
			logger.error("Error buscando usuarios baja")
			return res
				.status(400)
				.send(err.errmsg)
		}else{
			bajas = usersBajaArray.length;
		}
    });

	promises.push(userBajaPromise);

	var userAltaPromise = User.find({"fecha_alta":{$gte:start,$lte:end}}).exec(function (err,usersAltaArray) {
        if(err){
            logger.error("Error buscando usuarios alta")
            return res
                .status(400)
                .send(err.errmsg)
        }else{
            altas = usersAltaArray.length;
        }
    });

	promises.push(userAltaPromise);

	Q.all(promises).then(function () {

		//INGRESOS
        var netoIngresos = 0;
        var ivaIngresos = 0;
        var totalIngresos = 0;
        for(var i in ingresos){
        	netoIngresos += ingresos[i].cantidad;
        	ivaIngresos += ingresos[i].iva;
        	totalIngresos += ingresos[i].cantidad;
            totalIngresos += ingresos[i].iva;
		}
		for(var t in tickets){
        	netoIngresos += tickets[t].neto;
        	ivaIngresos += tickets[t].iva;
        	totalIngresos += tickets[t].neto;
        	totalIngresos += tickets[t].iva;
		}

		//GASTOS
		var netoGastos = 0;
		var ivaGastos = 0;
		var totalGastos = 0;
		for(var g in gastos){
			netoGastos += gastos[g].cantidad;
			totalGastos += gastos[g].cantidad;
			if(gastos[g].iva && gastos[g].iva != 0){
				ivaGastos += gastos[g].iva;
				totalGastos += gastos[g].iva;
			}
		}

		//CONSUMO
		var totalPorTipo = {};
		var totalPorSubtipo = {}
		var totalPorVariedad = {};
		var totalConsumo = 0;

		for(var x = 0; x < tickets.length; x++){
			for(var y = 0; y < tickets[x].dispensa.length; y++){
				totalConsumo += tickets[x].dispensa[y].cantidad;
				//tipo
				if(!totalPorTipo[tickets[x].dispensa[y].producto.tipo]){
                    totalPorTipo[tickets[x].dispensa[y].producto.tipo] = tickets[x].dispensa[y].cantidad;
				}else{
                    totalPorTipo[tickets[x].dispensa[y].producto.tipo] += tickets[x].dispensa[y].cantidad;
				}
				//subtipo
				if(!totalPorSubtipo[tickets[x].dispensa[y].producto.tipo]){
                    totalPorSubtipo[tickets[x].dispensa[y].producto.tipo] = {}
				}
				if(!totalPorSubtipo[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo]){
                    totalPorSubtipo[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo] = tickets[x].dispensa[y].cantidad
				}else{
                    totalPorSubtipo[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo] += tickets[x].dispensa[y].cantidad
				}
				//variedad
                if(tickets[x].dispensa[y].producto.variedad != null){
                    if(!totalPorVariedad[tickets[x].dispensa[y].producto.tipo]){
                        totalPorVariedad[tickets[x].dispensa[y].producto.tipo] = {}
                    }
                    if(!totalPorVariedad[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo]){
                        totalPorVariedad[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo] = {}
                    }
                    if(!totalPorVariedad[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo][tickets[x].dispensa[y].producto.variedad]){
                        totalPorVariedad[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo][tickets[x].dispensa[y].producto.variedad] = tickets[x].dispensa[y].cantidad;
                    }else{
                        totalPorVariedad[tickets[x].dispensa[y].producto.tipo][tickets[x].dispensa[y].producto.subtipo][tickets[x].dispensa[y].producto.variedad] += tickets[x].dispensa[y].cantidad;
                    }
				}else{
                	if(!totalPorVariedad['Sin variedad']){
                		totalPorVariedad['Sin variedad'] = tickets[x].dispensa[y].cantidad;
					}else{
                        totalPorVariedad['Sin variedad'] += tickets[x].dispensa[y].cantidad;
					}
				}
			}//dispensas
		}//tickets

		//cast de los id de los tipos, subtipos y variedades
		for(var a = 0; a < types.length; a++){
			for(var t in totalPorTipo){
				if(t.toString() == types[a]._id.toString()){
					totalPorTipo[types[a].nombre] = totalPorTipo[t];
					delete totalPorTipo[t]
				}
			}
			for(var s in totalPorSubtipo){
				if(s.toString() == types[a]._id.toString()){
					totalPorSubtipo[types[a].nombre] = totalPorSubtipo[s]
					delete totalPorSubtipo[s]
				}
			}
			for(var v in totalPorVariedad){
				if(v.toString() == types[a]._id.toString()){
					totalPorVariedad[types[a].nombre] = totalPorVariedad[v]
					delete totalPorVariedad[v]
				}
			}
		}

		for(var b = 0; b < subtypes.length; b++){
			for(var s in totalPorSubtipo){
				for(var su in totalPorSubtipo[s]){
					if(su.toString() == subtypes[b]._id.toString()){
						totalPorSubtipo[s][subtypes[b].nombre] = totalPorSubtipo[s][su]
						delete totalPorSubtipo[s][su]
					}
				}
			}
			for(var v in totalPorVariedad){
				for(var va in totalPorVariedad[v]){
					if(va.toString() == subtypes[b]._id.toString()){
						totalPorVariedad[v][subtypes[b].nombre] = totalPorVariedad[v][va]
						delete totalPorVariedad[v][va]
					}
				}
			}
		}

		for(var c = 0; c < varieties.length; c++){
			for(var v in totalPorVariedad){
				for(var va in totalPorVariedad[v]){
					for(var vai in totalPorVariedad[v][va]){
						if(vai.toString() == varieties[c]._id.toString()){
							totalPorVariedad[v][va][varieties[c].nombre] = totalPorVariedad[v][va][vai]
							delete totalPorVariedad[v][va][vai]
						}
					}
				}
			}
		}

		//STOCK 1 de enero
		var milisConsulta = start.getTime();
		var totalMax = 0;
		for(var p = 0; p < productos.length; p++){
			var max = 0;
			var consulta = 0;
			var resto = 0;
			for(var s = 0; s < productos[p].stock.length; s++){
				if(s == 0){
					resto = productos[p].stock[s].fecha.getTime() - milisConsulta;
                    max = productos[p].stock[s].cantidad;
				}
				consulta = productos[p].stock[s].fecha.getTime() - milisConsulta;
				if(resto > consulta){
					max = productos[p].stock[s].cantidad;
					resto = consulta
				}
			}
			totalMax += max
		}
		//STOCK 31 diciembre
		var milisConsultaFin = end.getTime();
		var totalMaxFin = 0;
        for(var p = 0; p < productos.length; p++){
        	var maxFin = 0;
            var consultaFin = 0;
            var restoFin = 0;
            for(var s = 0; s < productos[p].stock.length; s++){
                if(s == 0){
                    restoFin = milisConsulta - productos[p].stock[s].fecha.getTime() ;
                    maxFin = productos[p].stock[s].cantidad;
                }
                consultaFin = milisConsulta - productos[p].stock[s].fecha.getTime() ;
                if(resto > consultaFin){
                    maxFin = productos[p].stock[s].cantidad;
                    restoFin = consultaFin
                }


            }
            totalMaxFin += maxFin;
        }

		//compose response
		var respuesta = {}
		respuesta['ingresos'] = {}
		respuesta.ingresos['neto'] = netoIngresos.toFixed(2);
		respuesta.ingresos['iva'] = ivaIngresos.toFixed(2);
		respuesta.ingresos['total'] = totalIngresos.toFixed(2);
		respuesta['gastos'] = {};
		respuesta.gastos['neto'] = netoGastos.toFixed(2);
		respuesta.gastos['iva'] = ivaGastos.toFixed(2);
		respuesta.gastos['total'] = totalGastos.toFixed(2);
		respuesta['bajas'] = bajas;
		respuesta['altas'] = altas;
		respuesta['consumo'] = {};
		respuesta.consumo['tipo'] = totalPorTipo;
		respuesta.consumo['subtipo'] = totalPorSubtipo;
		respuesta.consumo['variedad'] = totalPorVariedad;
		respuesta.consumo['total'] = totalConsumo;
		respuesta.consumo['media'] = (totalConsumo/12).toFixed(2);
		respuesta['stock'] = {};
		respuesta.stock['enero'] = totalMax;
		respuesta.stock['diciembre'] = totalMaxFin;

        return res
            .status(200)
            .send(respuesta)
	}, function (err) {
		return res
			.status(400)
			.send("Error buscando productos: "+err);
	})
}