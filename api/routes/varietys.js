'use strict';

var varietyController = require('../controllers/varietys.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//varietys
	app.get('/variety', middleware.ensureAuthenticated, varietyController.list);
	app.post('/variety', middleware.ensureAuthenticated, varietyController.create);
	app.get('/variety/:varietyId', middleware.ensureAuthenticated, varietyController.find);
	app.put('/variety/:varietyId', middleware.ensureAuthenticated, varietyController.update);
	app.delete('/variety/:varietyId', middleware.ensureAuthenticated, varietyController.delete);

	//Finish by binding the variety middleware
	app.param('varietyId', varietyController.varietyByID);
}