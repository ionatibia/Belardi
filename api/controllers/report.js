'use strict';
/**
 *
 * Module dependencies
 *
 */
var mongoose = require('mongoose'),
	Ticket = mongoose.model('Ticket');
var Q = require('q');

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
	//promise cuotas

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