'use strict';

var subtypeController = require('../controllers/subtypes.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//subtypes
	app.get('/products/subtype', middleware.ensureAuthenticated, subtypeController.list);
	app.post('/products/subtype', middleware.ensureAuthenticated, subtypeController.create);
	app.get('/products/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.find);
	app.put('/products/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.update);
	app.delete('/products/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.delete);

	//Finish by binding the subtype middleware
	app.param('subtypeId', subtypeController.subtypeByID);
}