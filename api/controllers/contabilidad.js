'use strict';
/**
 *
 * Module dependencies
 *
 */
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Ingreso = mongoose.model('Ingreso'),
	Gasto = mongoose.model('Gasto'),
	Total = mongoose.model('Total'),
	Ticket = mongoose.model('Ticket');
//mongoose.set('debug',true)
var Q = require('q');

//log
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/contabilidad.log' })
    ]
});

exports.addCuotaUser = function (req,res) {
	if (req.body.socio == undefined || req.body.socio == '' || req.body.cuota == undefined || req.body.cuota == '') {
		logger.warn("Peticion de ingreso sin datos")
		return res
			.status(400)
			.send("Faltan datos")
	}
	var user = req.body.socio;

	User.findOne({numero:user.numero},function (err,socio) {
		if (err) {
			logger.error("Fallo al buscar cuota socio: "+user.dni);
            return res
                .status(400)//bad request
                .send("fallo al buscar cuota socio "+err)
		}else{
			if (!socio) {
				return res
					.status(400)
					.send("Socio no existe")
			}else{
				socio.cuota += req.body.cuota;
				socio.save(function (err) {
					if(err){
						logger.error("Error actualizando cuota de socio "+socio.dni)
						return res
							.status(400)
							.send("Error actualizando cuota de socio "+socio.dni)
					}else{
						logger.info("Añadido "+req.body.cuota+"€ de cuota al socio "+req.body.socio.dni)
						return res
							.status(200)
							.send(req.body.socio)
					}
				})
			}
		}
	})
}

exports.addCuota = function (req,res) {
	var cuota = req.body.cuota;
	var socios = req.body.socios;
	var sociosObj = [];
	var promises = [];
	var otherPromises = [];

	for (var i = 0; i < socios.length; i++) {
		var promise = User.findById(socios[i],function (err,user) {
			if (err) {
				logger.error("Error buscando usuarios para añadir cuota");
				return res
					.status(500)
					.send("Error buscando usuarios para añadir cuota "+err)
				}else{
					if (!user) {
						return res
							.status(400)
							.send("Usuario no existe")
					}
					user.cuota += cuota;
					user.save(function (err) {
						if (err) {
							logger.error("Error actualizando cuota a usuario "+user.dni)
							return res
								.status(500)
								.send("Error actualizando cuota a usuario "+user.dni)
						}
					})
				}
			
		})
		promises.push(promise)
	}

	Q.all(promises).then(function () {
		return res
			.status(200)
			.send("Sumada a la cuota de todos los usuarios "+cuota+"€");
	}, function (err) {
		logger.error("Error buscando socios para añadir cuota");
		return res
			.status(500)
			.send("Error buscando socios para añadir cuota "+err)
	})

}

/*================================
=            Ingresos            =
================================*/
exports.listIngresos = function (req,res) {
	Ingreso.find().sort('-fecha').exec(function (err,ingresos) {
		if (err) {
			logger.error("Error buscando ingresos")
			return res
				.status(500)
				.send("Error buscando ingresos")
		}else{
			return res
				.status(200)
				.send(ingresos)
		}
	})
}

exports.addIngreso = function (req,res) {
	var promises = [];
	var totalObj = {};
	var socioObj = {};
	if (req.body.ingreso.tipo != 'cuota' && req.body.ingreso.tipo != 'aportacion' && req.body.ingreso.tipo != 'otros') {
		return res
			.status(400)
			.send("El tipo no es el correcto")
	}
	if (req.body == '' || req.body == undefined) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var ingreso = new Ingreso(req.body.ingreso);
	ingreso.fecha = Date.now();

	var prom = ingreso.save(function (err) {
		if (err) {
			logger.error("Error guardando ingreso")
			return res
				.status(500)
				.send("Error guardando ingreso "+err)
		}
	})//ingreso save
	promises.push(prom);

	var prom2 = Total.findOne().sort({fecha: -1}).exec(function (err,total) {
		if (err) {
			logger.error("Error buscando total")
			return res
				.status(500)
				.send("Error buscando total "+err)
		}else{
			if (!total) {
				logger.error("No hay totales")
				return res
					.status(500)
					.send("No hay totales. Ingresar total en config ")
			}else{
				totalObj = total 
			}
		}
	})//find total
	promises.push(prom2)

	if (req.body.socio != undefined) {
		var prom3 = User.findOne({numero:req.body.socio},function (err,socio) {
			if (err) {
				logger.error("Error buscando socio para reducir cuota")
				return res
					.status(500)
					.send("Error buscando socio para reducir cuota "+err)
			}else{
				socioObj = socio;
			}
		})
	}
	promises.push(prom3)

	Q.all(promises).then(function () {
		var sumTotal = totalObj.cantidad + ingreso.cantidad;
		var newTotal = new Total({'cantidad':sumTotal,'fecha':Date.now()})
		newTotal.save(function (err) {
			if (err) {
				logger.error("Error guardando total")
				return res
					.status(500)
					.send("Error guardando total "+err)
			}else{
				if (req.body.socio != undefined) {
					var cuotaT = socioObj.cuota - (ingreso.cantidad + ingreso.iva);
					socioObj.cuota = cuotaT;
					socioObj.save(function (err) {
						if (err) {
							logger.error("Error actualizando cuota socio")
							return res
								.status(500)
								.send("Error actualizando cuota socio "+err)
						}else{
							logger.info("Guardado ingreso "+ingreso.cantidad+"€ y sumado en total")
							return res
								.status(200)
								.send(ingreso)
						}
					})
				}else{
					logger.info("Guardado ingreso "+ingreso.cantidad+"€ y sumado en total")
					return res
						.status(200)
						.send(ingreso)
				}
			}
		})
	}, function (err) {
		logger.error("Error guardando ingreso o buscando total")
		return res
			.status(500)
			.send("Error guardando ingreso o buscando total "+err)
	})
}//add ingreso

/*exports.deleteIngreso = function (req,res) {
	var ingreso = req.ingreso
	var promises = [];
	var totalObj = {};

	var prom2 = Total.findOne().sort({fecha: -1}).exec(function (err,total) {
		if (err) {
			logger.error("Error buscando total")
			return res
				.status(500)
				.send("Error buscando total "+err)
		}else{
			if (!total) {
				logger.error("No hay totales")
				return res
					.status(500)
					.send("No hay totales. Ingresar total en config ")
			}else{
				totalObj = total 
			}
		}
	})//find total
	promises.push(prom2)

	var prom = ingreso.remove(function (err) {
		if (err) {
			logger.error("Error borrando ingreso")
			return res
				.status(500)
				.send("Error borrando ingreso "+err)
		}
	})//delete ingreso
	promises.push(prom);

	Q.all(promises).then(function () {
		var sumTotal = totalObj.cantidad - ingreso.cantidad;
		var newTotal = new Total({'cantidad':sumTotal})
		newTotal.save(function (err) {
			if (err) {
				logger.error("Error guardando total")
				return res
					.status(500)
					.send("Error guardando total "+err)
			}else{
				return res
					.status(200)
					.send(ingreso)
			}
		})
	}, function (err) {
		logger.error("Error borrando ingreso o buscando total")
		return res
			.status(500)
			.send("Error borrando ingreso o buscando total "+err)
	})

}*/
/*=====  End of Ingresos  ======*/

/*================================
=            Gastos            =
================================*/
exports.listGastos = function (req,res) {
	Gasto.find().sort('-fecha').exec(function (err,gastos) {
		if (err) {
			logger.error("Error buscando gastos")
			return res
				.status(500)
				.send("Error buscando gastos")
		}else{
			return res
				.status(200)
				.send(gastos)
		}
	})
}

exports.addGasto = function (req,res) {
	var promises = []
	var totalObj = {}
	if (req.body.tipo != 'factura' && req.body.tipo != 'nomina' && req.body.tipo != 'otros') {
		return res
			.status(400)
			.send("El tipo no es el correcto")
	}
	if (req.body == '' || req.body == undefined) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var gasto = new Gasto(req.body);
	gasto.fecha = Date.now()

	var prom = gasto.save(function (err) {
		if (err) {
			logger.error("Error guardando gasto")
			return res
				.status(500)
				.send("Error guardando gasto "+err)
		}
	})//save gasto
	promises.push(prom);

	var prom2 = Total.findOne().sort({fecha: -1}).exec(function (err,total) {
		if (err) {
			logger.error("Error buscando total")
			return res
				.status(500)
				.send("Error buscando total "+err)
		}else{
			if (!total) {
				logger.error("No hay totales")
				return res
					.status(500)
					.send("No hay totales. Ingresar total en config ")
			}else{
				totalObj = total 
			}
		}
	})//find total
	promises.push(prom2)

	Q.all(promises).then(function () {
		if (gasto.tipo == 'factura') {
			var iva = ((parseInt(gasto.iva) / 100) + 1);
			var sumTotal = totalObj.cantidad - (gasto.cantidad * iva)
		}else{
			var sumTotal = totalObj.cantidad - gasto.cantidad;
		}
		
		var newTotal = new Total({'cantidad':sumTotal,'fecha':Date.now()})
		newTotal.save(function (err) {
			if (err) {
				logger.error("Error guardando total")
				return res
					.status(500)
					.send("Error guardando total "+err)
			}else{
				logger.info("Guardado gasto "+gasto.cantidad+"€ y sumado en total")
				return res
					.status(200)
					.send(gasto)

			}
		})
	}, function (err) {
		logger.error("Error guardando gasto o buscando total")
		return res
			.status(500)
			.send("Error guardando gasto o buscando total "+err)
	})

}

/*exports.deleteGasto = function (req,res) {
	var gasto = req.gasto

	gasto.remove(function (err) {
		if (err) {
			logger.error("Error borrando gasto")
			return res
				.status(500)
				.send("Error borrando gasto "+err)
		}else{
			return res
				.status(200)
				.send(gasto)
		}
	})
}*/
/*=====  End of Gastos  ======*/

/*=============================
=            Total            =
=============================*/
exports.listTotal = function (req,res) {
	Total.find().sort('fecha').exec(function (err,totales) {
		if (err) {
			logger.error("Error buscando totales")
			return res
				.status(500)
				.send("Error buscando totales")
		}else{
			return res
				.status(200)
				.send(totales)
		}
	})
}

exports.addTotal = function (req,res) {
	if (req.body == '' || req.body == undefined) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var total = new Total(req.body);
	total.fecha = Date.now()

	total.save(function (err) {
		if (err) {
			logger.error("Error guardando total")
			return res
				.status(500)
				.send("Error guardando total "+err)
		}else{
			return res
				.status(200)
				.send(total)
		}
	})
}
/*=====  End of Total  ======*/

exports.cuentaIva = function (req,res) {
	if (!req.body.startDate || !req.body.endDate) {
		return res
			.status(400)
			.send("Faltan parametros")
	}

	var startArray = req.body.startDate.split('/');
	var startDate = new Date(startArray[2],(parseInt(startArray[1])-1),startArray[0])

	var endArray = req.body.endDate.split('/');
	var endDate = new Date(endArray[2],(parseInt(endArray[1])-1),endArray[0]);

	var cuentaIva = 0;
	var ivaDevolver = 0;

	var promises = [];
	var dispensas = [];
	var facturas = [];

	var prom = Ticket.find({fecha:{$gte: startDate, $lte: endDate}}, function (err,data) {
		if (err) {
			return res
				.status(400)
				.send("Error buscando tickets para cuenta iva "+err)
		}else{
			dispensas = data;
		}
	})
	promises.push(prom)

	var prom2 = Gasto.find({fecha:{$gte:startDate, $lte:endDate}},function (err,data) {
		if (err) {
			return res
				.status(400)
				.send("Error buscando gastos para cuenta iva "+err)
		}else{
			facturas = data;
		}
	})
	promises.push(prom2)

	Q.all(promises).then(function () {
		for (var i = 0; i < dispensas.length; i++) {
			cuentaIva += dispensas[i].iva;
		}
		for (var i = 0; i < facturas.length; i++) {
			ivaDevolver += parseFloat(facturas[i].iva)
			console.log(ivaDevolver)
		}
		return res
			.status(200)
			.send({'iva':cuentaIva, 'ivaD':ivaDevolver})
	}, function (err) {
		logger.error("Error buscando gasto o ticket cuenta iva")
		return res
			.status(500)
			.send("Error buscando gasto o ticket cuenta iva "+err)
	})
}

/**
 *
 * Ingreso middleware
 *
 */
module.exports.ingresoByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		logger.error("El ID del ingreso no es valido")
		return res
			.status(400)
			.send("El ID del ingreso no es valido");
	}
	//busca el ingreso mediante _id
	Ingreso.findById(id).exec(function (err, ingreso) {
		if (err) {
			logger.error("Error buscando ingreso por ID")
			return next(err);
		} else if (!ingreso) {
			logger.warn("No hay ingresos con el id: "+id)
			return res
				.status(404)
				.send("No hay ingresos con el id: "+id);
		}
		//guardamos en req.ingreso el articulo
		req.ingreso = ingreso;
		//sigue
		next();
	});
};//exports ingresoByID

/**
 *
 * Gasto middleware
 *
 */
module.exports.gastoByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		logger.error("El ID del gasto no es valido")
		return res
			.status(400)
			.send("El ID del gasto no es valido");
	}
	//busca el gasto mediante _id
	Gasto.findById(id).exec(function (err, gasto) {
		if (err) {
			logger.error("Error buscando gasto por ID")
			return next(err);
		} else if (!gasto) {
			logger.warn("No hay gastos con el id: "+id)
			return res
				.status(404)
				.send("No hay gastos con el id: "+id);
		}
		//guardamos en req.gasto el articulo
		req.gasto = gasto;
		//sigue
		next();
	});
};//exports ingresoByID