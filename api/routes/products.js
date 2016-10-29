'use strict';

var productController = require('../controllers/product.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {
	//products
	app.get('/products', middleware.ensureAuthenticated, productController.list);
	app.post('/products', middleware.ensureAuthenticated, productController.create);
	app.get('/products/:productId', middleware.ensureAuthenticated, productController.find);
	app.put('/products/:productId', middleware.ensureAuthenticated, productController.update);
	app.delete('/products/:productId', middleware.ensureAuthenticated, productController.delete);

	//Finish by binding the product middleware
	app.param('productId', productController.productByID);
}