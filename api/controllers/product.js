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
//var log4js2 = require('log4js');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/product.log', category: 'product' },
	  ]
	});
    
var log = log4js.getLogger('product');
//var logAjuste = log4js.getLogger('ajuste');

/**
 *
 * CREATE product
 *
 */
exports.create = function (req, res) {

	var product = new Product(req.body)
	product.stock = [{}]
	console.log(product)

	product.save(function (err) {
		if (err) {
			log.error("Error guardando producto: "+err)
			return res
				.status(400)
				.send("Error guardando producto: "+err)
		} else {
			//devolvemos el articulo
			return res
				.status(200)
				.json(product);
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

	/*var product = req.product;
	if (req.body.stock > req.product.stock) {
		logAjuste.info("Añadido stock de "+req.product.stock+" a "+req.body.stock+" al producto "+req.product.nombre);
	} else if (req.body.stock < req.product.stock) {
		logAjuste.warn("Ajuste de inventario stock de "+req.product.stock+" a "+req.body.stock+" al producto "+req.product.nombre);
	}*/
	//merge del producto guardado
	var productUpdated = lodash.assign(req.product,req.body);
	//guardamos el producto modificado
	Product.update({_id:req.product._id},productUpdated,function (err) {
		if (err) {
			log.error("Error actualizando producto: "+err)
			return res
				.status(400)
				.send("Error actualizando producto: "+err);
		} else {
			//devolvemos el producto modificado
			return res
				.status(200)
				.json(productUpdated);
		}
	});
};//exports update

/**
 *
 * DELETE product
 *
 */
module.exports.delete = function (req, res) {
	//recogemos el producto ByID
	var product = req.product;
	//borramos el producto
	product.remove(function (err) {
		if (err) {
			log.error("Error borrando producto: "+err)
			return res
				.status(400)
				.send("Error borrando producto: "+err);
		} else {
			return res
				.status(200)
				.json(product);
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
	Product.find().sort('-nombre').populate('tipo').populate('subtipo').populate('variedad').exec(function (err, products) {
		if (err) {
			log.error("Error buscando productos: "+err)
			return res
				.status(400)
				.send("Error buscando productos: "+err);
		} else {
			//devolvemos todos los articulos
			return res
				.status(200)
				.json(products);
		}
	});
};//exports list

module.exports.addStock = function (req,res) {
	var stockBefore = req.product.stock[req.product.stock.length-1].cantidad;
	var stockAfter = req.body.cantidad + stockBefore;
	req.product.stock.push({'cantidad':stockAfter})
	req.product.save(function (err) {
		if (err) {
			console.log(err)//falta el log de inventario
			return res
				.status(400)
				.send("Error guardando productos: "+err);
		}else{
			return res
				.status(200)
				.json(req.product);
		}
	})
}

module.exports.ajusteStock = function (req,res) {
	req.product.stock.push({'cantidad':req.body.cantidad})
	req.product.save(function (err) {
		if (err) {
			console.log(err)//falta el log de inventario
			return res
				.status(400)
				.send("Error guardando productos: "+err);
		}else{
			return res
				.status(200)
				.json(req.product);
		}
	})
}


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