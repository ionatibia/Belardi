'use strict';
/**
 *
 * Module dependencies
 *
 */
var mongoose = require('mongoose'),
	Ticket = mongoose.model('Ticket'),
	Ingreso = mongoose.model('Ingreso'),
	Product = mongoose.model('Product');
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
	var ano = req.body.ano;
	var start = new Date(ano,0,1);
	var end = new Date(ano,11,31,23,59);
	console.log(ano+"    "+start+"    "+end)

	var productPromise = Product.find().populate('tipo').populate('subtipo').populate('variedad').exec(function (err, products) {
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

	var ticketPromise = Ticket.find({"fecha":{$gte:start,$lte:end}}).exec(function (err,ticketsArray) {
		if (err) {
			logger.error("Error buscando tickets")
			return res
				.status(400)
				.send("Error buscando tickets: "+err.errmsg);
		}else{
			tickets = ticketsArray
		}
	})

	Q.all(promises).then(function () {
		//console.log(productos)
		for(var p in productos){
			var ano = productos[p].stock[0].fecha.getFullYear()
		}
		console.log(tickets)
	}, function (err) {
		return res
			.status(400)
			.send("Error buscando productos: "+err);
	})

	return res
		.status(200)
		.send("ok")
}