'use strict';
/**
 *
 * Module dependencies
 *
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Type = mongoose.model('Type'),
	lodash = require('lodash');
//log
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/types.log' })
    ]
});

/**
 *
 * CREATE type
 *
 */
exports.create = function (req, res) {
	var type = new Type(req.body)

	type.save(function (err) {
		if (err) {
			logger.error("Error guardando tipo")
			return res
				.status(400)
				.send("Error guardando tipo: "+err.errmsg)
		} else {
			logger.info("Guardado tipo "+type.nombre)
			return res
				.status(200)
				.json(type);
		}
	});
};//exports create

/**
 *
 * SHOW type byID
 *
 */
module.exports.find = function (req, res) {
	res.json(req.type);
};

/**
 *
 * UPDATE type
 *
 */
module.exports.update = function (req, res) {

	//merge del tipo guardado
	var typeUpdated = lodash.assign(req.type,req.body);
	//guardamos el tipo modificado
	Type.update({_id:req.type._id},typeUpdated,function (err) {
		if (err) {
			logger.error("Error actualizando tipo")
			return res
				.status(400)
				.send("Error actualizando tipo: "+err.errmsg);
		} else {
			logger.info("Actualizado tipo "+typeUpdated.nombre)
			//devolvemos el tipo modificado
			return res
				.status(200)
				.json(typeUpdated);
		}
	});
};//exports update

/**
 *
 * DELETE type
 *
 */
module.exports.delete = function (req, res) {
	//recogemos el tipo ByID
	var type = req.type;
	//borramos el tipo
	type.remove(function (err) {
		if (err) {
			logger.error("Error borrando tipo")
			return res
				.status(400)
				.send("Error borrando tipo: "+err.errmsg);
		} else {
			logger.info("Borrado el tipo "+type.nombre)
			return res
				.status(200)
				.json(req.type);
		}
	});
};//exports delete

/**
 *
 * LIST types
 *
 */
module.exports.list = function (req, res) {
	//buscamos todos los tipos ordenados por fecha
	Type.find().sort('nombre').exec(function (err, types) {
		if (err) {
			logger.error("Error buscando tipos")
			return res
				.status(400)
				.send("Error buscando tipos: "+err.errmsg);
		} else {
			//devolvemos todos los tipos
			return res
				.status(200)
				.json(types);
		}
	});
};//exports list


/**
 *
 * TYPE middleware
 *
 */
module.exports.typeByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		logger.error("El ID del tipo no es valido")
		return res
			.status(400)
			.send("El ID del tipo no es valido");
	}
	//busca el tipo mediante _id
	Type.findById(id).exec(function (err, type) {
		if (err) {
			logger.error("Error buscando tipos por ID")
			return next(err);
		} else if (!type) {
			logger.warn("No hay tipos con el id: "+id)
			return res
				.status(404)
				.send("No hay tipos con el id: "+id);
		}
		//guardamos en req.type el tipo
		req.type = type;
		//sigue
		next();
	});
};//exports typeByID