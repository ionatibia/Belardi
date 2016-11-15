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
	Total = mongoose.model('Total');

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
	Ingreso.find().sort('fecha').exec(function (err,ingresos) {
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
	//comprobar tipo
	if (req.body == '' || req.body == undefined) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var ingreso = new Ingreso(req.body);

	ingreso.save(function (err) {
		if (err) {
			logger.error("Error guardando ingreso")
			return res
				.status(500)
				.send("Error guardando ingreso "+err)
		}else{
			return res
				.status(200)
				.send(ingreso)
		}
	})
}

exports.deleteIngreso = function (req,res) {
	var ingreso = req.ingreso

	ingreso.remove(function (err) {
		if (err) {
			logger.error("Error borrando ingreso")
			return res
				.status(500)
				.send("Error borrando ingreso "+err)
		}else{
			return res
				.status(200)
				.send(ingreso)
		}
	})
}
/*=====  End of Ingresos  ======*/

/*================================
=            Gastos            =
================================*/
exports.listGastos = function (req,res) {
	Gasto.find().sort('fecha').exec(function (err,gastos) {
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
	//comprobar tipo
	if (req.body == '' || req.body == undefined) {
		return res
			.status(400)
			.send("Faltan parametros")
	}
	var gasto = new Gasto(req.body);

	gasto.save(function (err) {
		if (err) {
			logger.error("Error guardando gasto")
			return res
				.status(500)
				.send("Error guardando gasto "+err)
		}else{
			return res
				.status(200)
				.send(gasto)
		}
	})
}

exports.deleteGasto = function (req,res) {
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
}
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