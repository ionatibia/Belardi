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
	lodash = require('lodash');
var log4js = require('log4js');
var fs = require('fs');
var sys = require('util');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/ticket.log', category: 'ticket' }
	  ]
	});
var log = log4js.getLogger('ticket');
var Q = require('q');

/**
 *
 * CREATE ticket
 *
 */
exports.create = function (req, res) {
	var img = req.body.firma;
	var data = img.replace(/^data:image\/\w+;base64,/, "");
	var buf = new Buffer(data, 'base64');
	var firmaUrl = 'public/firmas/' + req.body.socio+Date.now() + '.png';
	fs.writeFile(firmaUrl, buf);
	var promises = [];
	var socioObj = {};
	var userObj = {};
	var productos = req.body.productos;
	var socio = req.body.socio
	var user = req.user
	var productosTicket = [];

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
		productos[i].stock.push({'cantidad':stockBefore-cantidad})
		var stockCompleto = productos[i].stock

		var promise = Product.update({_id: productos[i]._id},{$set:{stock: stockCompleto}},function (err) {
			if (err) {
				console.log(err)//falta el log de inventario
				return res
					.status(400)
					.send("Error guardando productos: "+err);
			}else{
				productosTicket.push({'producto':productos[i],'cantidad':cantidad})
			}
		})
		promises.push(promise);
	}
	

	Q.all(promises).then(function (response) {
		var ticket = new Ticket({'usuario':userObj,'socio':socioObj,'dispensa':productosTicket,'firmaUrl':firmaUrl})
		ticket.save(function (err) {
			if (err) {
				console.log(err)
				return res
					.status(400)
					.send("Error guardando productos: "+err);
			}else{
				return res
					.status(200)
					.send(ticket);
			}
		})
	}, function (err) {
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
module.exports.update = function (req, res) {

	var ticket = req.ticket;
	//merge del ticket guardado
	var ticketUpdated = lodash.assign(ticket,req.body);
	//guardamos el ticket modificado
	Ticket.update({_id:ticket._id},ticketUpdated,function (err) {
		if (err) {
			log.error("Error actualizando ticket: "+err)
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
};//exports update

/**
 *
 * DELETE ticket
 *
 */
module.exports.delete = function (req, res) {
	//recogemos el ticket ByID
	var ticket = req.ticket;
	//borramos el ticket
	ticket.remove(function (err) {
		if (err) {
			log.error("Error borrando ticket: "+err)
			return res
				.status(400)
				.send("Error borrando ticket: "+err);
		} else {
			return res
				.status(200)
				.json(ticket);
		}
	});
};//exports delete

/**
 *
 * LIST ticket
 *
 */
module.exports.list = function (req, res) {
	//buscamos todos los tickets ordenados por fecha
	Ticket.find().sort('-fecha').exec(function (err, ticket) {
		if (err) {
			log.error("Error buscando tickets: "+err)
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
		log.error("El ID del ticket no es valido")
		return res
			.status(400)
			.send("El ID del ticket no es valido");
	}
	//busca el ticket mediante _id
	Ticket.findById(id).exec(function (err, ticket) {
		if (err) {
			log.error("Error buscando ticket por ID: "+err)
			return next(err);
		} else if (!ticket) {
			log.warn("No hay tickets con el id: "+id)
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