'use strict';

var reportController = require('../controllers/report.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//products
	app.post('/informes/tickets', middleware.ensureAuthenticated, reportController.ticketReport);
	app.post('/informes/trimestral', middleware.ensureAuthenticated, reportController.trimestralReport)
	

}