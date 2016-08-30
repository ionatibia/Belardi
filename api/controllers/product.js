'use strict';
/**
 *
 * Module dependencies
 *
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Product = mongoose.model('Product'),
	lodash = require('lodash');
//log
var log4js = require('log4js');
    
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/product.log', category: 'product' }
  ]
});
var log = log4js.getLogger('product');

/**
 *
 * CREATE product
 *
 */
exports.create = function (req, res) {

	var product = new Product(req.body)

	product.save(function (err) {
		if (err) {
			log.error("Error guardando producto: "+err)
			return res
				.status(400)
				.send("Error guardando producto: "+err)
		} else {
			//devolvemos el articulo
			res.json(product);
		}
	});
};//exports create

/**
 *
 * SHOW product byID
 *
 */
module.exports.find = function (req, res) {
	res.json(req.product);
};//exports read

/**
 *
 * UPDATE product
 *
 */
module.exports.update = function (req, res) {

	var product = req.product;
	//merge del producto guardado
	var productUpdated = lodash.assign(product,req.body);
	//guardamos el producto modificado
	Product.update({_id:product._id},productUpdated,function (err) {
		if (err) {
			log.error("Error actualizando producto: "+err)
			return res
				.status(400)
				.send("Error actualizando producto: "+err);
		} else {
			//devolvemos el producto modificado
			res.json(product);
		}
	});
};//exports update

/**
 *
 * DELETE product
 *
 */
module.exports.delete = function (req, res) {
	//recogemos el articulo ByID
	var product = req.product;
	//borramos el articulo
	product.remove(function (err) {
		if (err) {
			log.error("Error borrando producto: "+err)
			return res
				.status(400)
				.send("Error borrando producto: "+err);
		} else {
			res.json(product);
		}
	});
};//exports delete

/**
 *
 * LIST products
 *
 */
module.exports.list = function (req, res) {
	//buscamos todos los articulos ordenados por fecha
	Product.find().sort('-nombre').exec(function (err, products) {
		if (err) {
			log.error("Error buscando productos: "+err)
			return res
				.status(400)
				.send("Error buscando productos: "+err);
		} else {
			//devolvemos todos los articulos
			res.json(products);
		}
	});
};//exports list

/**
 *
 * PRODUCT middleware
 *
 */
module.exports.productByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		log.error("El ID del producto no es valido")
		return res
			.status(400)
			.send("El ID del producto no es valido");
	}
	//busca el producto mediante _id
	Product.findById(id).exec(function (err, product) {
		if (err) {
			log.error("Error buscando producto por ID: "+err)
			return next(err);
		} else if (!product) {
			log.warn("No hay productos con el id: "+id)
			return res
				.status(404)
				.send("No hay productos con el id: "+id);
		}
		//guardamos en req.product el articulo
		req.product = product;
		//sigue
		next();
	});
};//exports articleByID