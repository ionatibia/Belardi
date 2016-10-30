'use strict';

var subtypeController = require('../controllers/subtypes.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//subtypes
	app.get('/subtype', middleware.ensureAuthenticated, subtypeController.list);
	app.post('/subtype', middleware.ensureAuthenticated, subtypeController.create);
	app.get('/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.find);
	app.put('/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.update);
	app.delete('/subtype/:subtypeId', middleware.ensureAuthenticated, subtypeController.delete);

	//Finish by binding the subtype middleware
	app.param('subtypeId', subtypeController.subtypeByID);
}