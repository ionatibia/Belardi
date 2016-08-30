'use strict';

/**
*
*Module dependencies
*
*/
var path = require('path'),
	mongoose = require('mongoose'),
	Ticket = mongoose.model('Ticket'),
	lodash = require('lodash');
var log4js = require('log4js');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/ticket.log', category: 'ticket' }
	  ]
	});
var log = log4js.getLogger('ticket');

/**
 *
 * CREATE ticket
 *
 */
exports.create = function (req, res) {
	//Guardar objetos no string
	var ticket = new Ticket(req.body)

	ticket.save(function (err) {
		if (err) {
			log.error("Error guardando ticket: "+err)
			return res
				.status(400)
				.send("Error guardando ticket: "+err)
		} else {
			//devolvemos el articulo
			return res
				.status(200)
				.json(ticket);
		}
	});
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