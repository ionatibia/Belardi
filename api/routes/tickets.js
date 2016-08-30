'use strict';

var ticketController = require('../controllers/tickets.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	
	app.get('/tickets', middleware.ensureAuthenticated, ticketController.list);
	app.post('/tickets', middleware.ensureAuthenticated, ticketController.create);
	app.get('/tickets/:ticketId', middleware.ensureAuthenticated, ticketController.find);
	app.put('/tickets/:ticketId', middleware.ensureAuthenticated, ticketController.update);
	app.delete('/tickets/:ticketId', middleware.ensureAuthenticated, ticketController.delete);

	app.param('ticketId', ticketController.ticketByID);
}