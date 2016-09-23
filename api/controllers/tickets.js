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
	var usuario;
	var productos = []
	var socio;
	var promises = [];
	for (var i = 0; i < req.body.ticket.length; i++) {
		var promise = Product.findOne({tipo:req.body.ticket[i].tipo, subtipo: req.body.ticket[i].subtipo, nombre: req.body.ticket[i].producto}, function (err,product) {
			if (err) {
				console.log(err)
				log.warn('Error buscando producto '+req.body.ticket[i].producto)
				res.send('Error buscando producto '+req.body.ticket[i].producto)
			}
			if (product) {
				productos.push(product)
			}else{
				console.log("No se encuentra el producto "+req.body.ticket[i].producto)
				log.warn('Producto '+req.body.ticket[i].producto+' no encontrado')
				res.send('Producto '+req.body.ticket[i].producto+' no encontrado')
			}
		})
		promises.push(promise);
	}

	Q.all(promises).then(function (response) {
		console.log(response)
		console.log(JSON.stringify(productos))
	}, function (err) {
		console.log(err)
	})
	

	/*for (var i = 0; i < req.body.ticket.length; i++) {
		Product.findOne({tipo:req.body.ticket[i].tipo, subtipo: req.body.ticket[i].subtipo, nombre: req.body.ticket[i].producto}, function (err,product) {
			console.log("guardado producto "+i)
			if (err) {
				console.log(err)
				log.warn('Error buscando producto '+req.body.ticket[i].producto)
				res.send('Error buscando producto '+req.body.ticket[i].producto)
			}
			if (product) {
				productos.push(product)
			}else{
				console.log("No se encuentra el producto "+req.body.ticket[i].producto)
				log.warn('Producto '+req.body.ticket[i].producto+' no encontrado')
				res.send('Producto '+req.body.ticket[i].producto+' no encontrado')
			}
		})
	}

	User.findOne({numero:req.body.socio},function (err, user) {
		if (err) {
			console.log(err)
			log.warn('Error buscando usuario '+req.body.socio)
			res.send('Error buscando usuario '+req.body.socio)
		}
		if (user) {
			console.log("guardado sovio")
			socio = user;
		}else{
			console.log("No se encuentra el usuario "+req.body.socio)
			log.warn('Usuario '+req.body.socio+' no encontrado')
			res.send('Usuario '+req.body.socio+' no encontrado')
		}
	});
	User.findOne({_id:req.user},function (err, user) {
		if (err) {
			console.log(err)
			log.warn('Error buscando usuario '+req.user)
			res.send('Error buscando usuario '+req.user)
		}
		if (user) {
			console.log("usuario guardado")
			usuario = user;
		}else{
			console.log("No se encuentra el usuario "+req.user)
			log.warn('Usuario '+req.user+' no encontrado')
			res.send('Usuario '+req.user+' no encontrado')
		}
	});*/
	
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