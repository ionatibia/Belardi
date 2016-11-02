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

	//stock
	app.post('/products/addStock/:productId', middleware.ensureAuthenticated, productController.addStock);
	app.post('/products/ajusteStock/:productId', middleware.ensureAuthenticated, productController.ajusteStock);

	//Finish by binding the product middleware
	app.param('productId', productController.productByID);
}