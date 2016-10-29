'use strict';

var typesController = require('../controllers/types.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//types
	app.get('/products/types', middleware.ensureAuthenticated, typesController.list);
	app.post('/products/types', middleware.ensureAuthenticated, typesController.create);
	app.get('/products/types/:typeId', middleware.ensureAuthenticated, typesController.find);
	app.put('/products/types/:typeId', middleware.ensureAuthenticated, typesController.update);
	app.delete('/products/types/:typeId', middleware.ensureAuthenticated, typesController.delete);

	//Finish by binding the type middleware
	app.param('typeId', typesController.typeByID);
}