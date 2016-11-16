'use strict';

/**
*
*Module dependencies
*
*/
var path = require('path'),
	mongoose = require('mongoose'),
	Ticket = mongoose.model('Ticket'),
	User = mongoose.model('User'),
	Product = mongoose.model('Product'),
	lodash = require('lodash'),
	Total = mongoose.model('Total');
var fs = require('fs');
var sys = require('util');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/tickets.log' })
    ]
});
var Q = require('q');

/**
 *
 * CREATE ticket
 *
 */
exports.create = function (req, res) {
	var img = req.body.firma;
	//console.log(img)
	//var data = img.replace(/^data:image\/\w+;base64,/, "");
	//var buf = new Buffer(data, 'base64');
	//var firmaUrl = 'public/firmas/' + req.body.socio+Date.now() + '.png';
	//fs.writeFile(firmaUrl, buf);
	var promises = [];
	var socioObj = {};
	var userObj = {};
	var productos = req.body.productos;
	var socio = req.body.socio
	var user = req.user
	var productosTicket = [];
	var totalObj = {}

	//buscar usuario
	var promiseUser = User.findOne({_id: user}, function (err,user) {
		if (err) {
			console.log(err)
			return res
				.status(400)
				.send("Error buscando usuarios: "+err);
		}else{
			userObj = user
		}
	})
	promises.push(promiseUser);

	//buscar socio
	var promiseSocio = User.findOne({numero: socio}, function (err,user) {
		if (err) {
			console.log(err)
			return res
				.status(400)
				.send("Error buscando usuarios: "+err);
		}else{
			socioObj = user
		}
	})
	promises.push(promiseSocio);

	//actualizar stock de los productos y crear array dispensa para el ticket
	for(var i in productos){
		var cantidad = productos[i].cantidad
		var stockBefore = productos[i].stock[productos[i].stock.length-1].cantidad;
		if (stockBefore < cantidad) {
			return res
				.status(500)
				.send("Hay menos stock que el requerido")
		}
		productos[i].stock.push({'cantidad':stockBefore-cantidad})
		var stockCompleto = productos[i].stock

		var promise = Product.update({_id: productos[i]._id},{$set:{stock: stockCompleto}},function (err) {
			if (err) {
				logger.error("Error guardando stock nuevo en productos")
				return res
					.status(400)
					.send("Error guardando productos: "+err);
			}else{
				productosTicket.push({'producto':productos[i],'cantidad':cantidad})
			}
		})
		promises.push(promise);
	}

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
	

	Q.all(promises).then(function (response) {
		var ticket = new Ticket({'usuario':userObj,'socio':socioObj,'dispensa':productosTicket,'firmaUrl':img, 'neto':req.body.neto, 'iva':req.body.iva, 'fecha':Date.now()})
		ticket.save(function (err) {
			if (err) {
				logger.error("Error guardando ticket de socio "+socioObj.dni+'. Usuario: '+userObj.dni+'. Fecha: '+ticket.fecha)
				return res
					.status(400)
					.send("Error guardando ticket: "+err);
			}else{
				var sumTotal = totalObj.cantidad + req.body.neto;
				var newTotal = new Total({'cantidad':sumTotal,'fecha':Date.now()})
				newTotal.save(function (err) {
					if (err) {
						logger.error("Error guardando total")
						return res
							.status(500)
							.send("Error guardando total "+err)
					}
				})
				logger.info("Guardado ticket de socio "+socioObj.dni+'. Usuario: '+userObj.dni+'. Fecha: '+ticket.fecha)
				return res
					.status(200)
					.send(ticket);
			}
		})
	}, function (err) {
		logger.error("Error al ejecutar las promises")
		return res
			.status(400)
			.send("Error guardando ticket: "+err);
	})
	
};//exports create

/**
 *
 * SHOW ticket byID
 *
 */
module.exports.find = function (req, res) {
	res.json(req.ticket);
};//exports read

/**
 *
 * UPDATE ticket
 *
 */
/*module.exports.update = function (req, res) {

	var ticket = req.ticket;
	//merge del ticket guardado
	var ticketUpdated = lodash.assign(ticket,req.body);
	//guardamos el ticket modificado
	Ticket.update({_id:ticket._id},ticketUpdated,function (err) {
		if (err) {
			logger.error("Error actualizando ticket")
			return res
				.status(400)
				.send("Error actualizando ticket: "+err);
		} else {
			//devolvemos el ticketo modificado
			return res
				.status(200)
				.json(ticket);
		}
	});
};//exports update*/

/**
 *
 * DELETE ticket
 *
 */
/*module.exports.delete = function (req, res) {
	//recogemos el ticket ByID
	var ticket = req.ticket;
	//borramos el ticket
	ticket.remove(function (err) {
		if (err) {
			logger.error("Error borrando ticket")
			return res
				.status(400)
				.send("Error borrando ticket: "+err);
		} else {
			return res
				.status(200)
				.json(ticket);
		}
	});
};//exports delete*/

/**
 *
 * LIST ticket
 *
 */
module.exports.list = function (req, res) {
	//buscamos todos los tickets ordenados por fecha
	Ticket.find().sort('fecha').populate('usuario').populate('socio').exec(function (err, ticket) {
		if (err) {
			logger.error("Error buscando tickets")
			return res
				.status(400)
				.send("Error buscando tickets: "+err);
		} else {
			//devolvemos todos los tickets
			return res
				.status(200)
				.json(ticket);
		}
	});
};//exports list

/**
 *
 * TICKET middleware
 *
 */
module.exports.ticketByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		logger.error("El ID del ticket no es valido")
		return res
			.status(400)
			.send("El ID del ticket no es valido");
	}
	//busca el ticket mediante _id
	Ticket.findById(id).populate('socio').populate('usuario').exec(function (err, ticket) {
		if (err) {
			logger.error("Error buscando ticket por ID")
			return next(err);
		} else if (!ticket) {
			logger.warn("No hay tickets con el id: "+id)
			return res
				.status(404)
				.send("No hay tickets con el id: "+id);
		}
		//guardamos en req.ticket el articulo
		req.ticket = ticket;
		//sigue
		next();
	});
};//exports articleByID