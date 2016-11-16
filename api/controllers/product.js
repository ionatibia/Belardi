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
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/products.log' })
    ]
});

var loggerAjuste = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/inventario.log' })
    ]
});

/**
 *
 * CREATE product
 *
 */
exports.create = function (req, res) {

	var product = new Product(req.body)
	product.fecha_alta = Date.now()
	product.stock = [{}]

	product.save(function (err) {
		if (err) {
			logger.error("Error guardando producto: "+err)
			return res
				.status(400)
				.send("Error guardando producto: "+err.errmsg)
		} else {
			logger.info("Creado el producto: "+product.nombre)
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
	//merge del producto guardado
	var productUpdated = lodash.assign(req.product,req.body);
	//guardamos el producto modificado
	Product.update({_id:req.product._id},productUpdated,function (err) {
		if (err) {
			logger.error("Error actualizando producto")
			return res
				.status(400)
				.send("Error actualizando producto: "+err.errmsg);
		} else {
			logger.info("Producto "+productUpdated.nombre+' actualizado')
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
			logger.error("Error borrando producto: "+product.nombre)
			return res
				.status(400)
				.send("Error borrando producto: "+err.errmsg);
		} else {
			logger.info("Borrado producto "+product.nombre)
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
	Product.find().sort('nombre').populate('tipo').populate('subtipo').populate('variedad').exec(function (err, products) {
		if (err) {
			logger.error("Error buscando productos")
			return res
				.status(400)
				.send("Error buscando productos: "+err.errmsg);
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
			loggerAjuste.error("Error añadiendo stock al producto "+req.product.nombre)
			return res
				.status(400)
				.send("Error añadiendo stock: "+err.errmsg);
		}else{
			loggerAjuste.info("Añadido "+req.body.cantidad+" al producto "+req.product.nombre)
			return res
				.status(200)
				.json(req.product);
		}
	})
}

module.exports.ajusteStock = function (req,res) {
	if (req.body.observaciones != '' && req.body.observaciones != null && req.body.observaciones != undefined) {
		req.product.stock.push({'cantidad':req.body.cantidad, 'observaciones':req.body.observaciones});
	}else{
		req.product.stock.push({'cantidad':req.body.cantidad})
	}
	req.product.save(function (err) {
		if (err) {
			loggerAjuste.error("Error ajustando stock al producto "+req.product.nombre)
			return res
				.status(400)
				.send("Error ajustando stock: "+err.errmsg);
		}else{
			if (req.body.observaciones != '' && req.body.observaciones != null && req.body.observaciones != undefined){
				loggerAjuste.warn("Ajustado stock de producto "+req.product.nombre+" a "+req.body.cantidad+". Observaciones: "+req.body.observaciones+". User: "+req.user.dni)
			}else{
				loggerAjuste.warn("Ajustado stock de producto "+req.product.nombre+" a "+req.body.cantidad+". User: "+req.user.dni)
			}
			
			return res
				.status(200)
				.json(req.product);
		}
	})
}

module.exports.baja = function (req,res) {
	req.product.baja = true;
	req.product.save(function (err) {
		if (err) {
			logger.error("Error dando de baja el producto "+req.product.nombre)
			return res
				.status(400)
				.send("Error añadiendo stock: "+err.errmsg);
		}else{
			logger.info("Dado de baja el producto "+req.product.nombre)
			return res
				.status(200)
				.json(req.product);
		}
	})
}

module.exports.alta = function (req,res) {
	req.product.baja = false;
	req.product.save(function (err) {
		if (err) {
			logger.error("Error dando de alta el producto "+req.product.nombre)
			return res
				.status(400)
				.send("Error añadiendo stock: "+err.errmsg);
		}else{
			logger.info("Dado de alta el producto "+req.product.nombre)
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
		logger.error("El ID del producto no es valido")
		return res
			.status(400)
			.send("El ID del producto no es valido");
	}
	//busca el producto mediante _id
	Product.findById(id).exec(function (err, product) {
		if (err) {
			logger.error("Error buscando producto por ID")
			return next(err);
		} else if (!product) {
			logger.warn("No hay productos con el id: "+id)
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