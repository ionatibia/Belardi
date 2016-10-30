'use strict';

var typesController = require('../controllers/types.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//types
	app.get('/type', middleware.ensureAuthenticated, typesController.list);
	app.post('/type', middleware.ensureAuthenticated, typesController.create);
	app.get('/type/:typeId', middleware.ensureAuthenticated, typesController.find);
	app.put('/type/:typeId', middleware.ensureAuthenticated, typesController.update);
	app.delete('/products/type/:typeId', middleware.ensureAuthenticated, typesController.delete);

	//Finish by binding the type middleware
	app.param('typeId', typesController.typeByID);
}