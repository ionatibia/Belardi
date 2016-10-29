'use strict';

var varietyController = require('../controllers/varietys.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//varietys
	app.get('/products/variety', middleware.ensureAuthenticated, varietyController.list);
	app.post('/products/variety', middleware.ensureAuthenticated, varietyController.create);
	app.get('/products/variety/:varietyId', middleware.ensureAuthenticated, varietyController.find);
	app.put('/products/variety/:varietyId', middleware.ensureAuthenticated, varietyController.update);
	app.delete('/products/variety/:varietyId', middleware.ensureAuthenticated, varietyController.delete);

	//Finish by binding the variety middleware
	app.param('varietyId', varietyController.varietyByID);
}