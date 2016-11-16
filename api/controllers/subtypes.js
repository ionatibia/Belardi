'use strict';
/**
 *
 * Module dependencies
 *
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Subtype = mongoose.model('Subtype'),
	lodash = require('lodash');
//log
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/subtypes.log' })
    ]
});

/**
 *
 * CREATE subtype
 *
 */
exports.create = function (req, res) {

	var subtype = new Subtype(req.body)
	subtype.fecha_alta = Date.now();

	subtype.save(function (err) {
		if (err) {
			logger.error("Error guardando subtipo")
			return res
				.status(400)
				.send("Error guardando subtipo: "+err.errmsg)
		} else {
			logger.info("Guardado el subtipo "+subtype.nombre)
			return res
				.status(200)
				.json(subtype);
		}
	});
};//exports create

/**
 *
 * SHOW subtype byID
 *
 */
module.exports.find = function (req, res) {
	res.json(req.subtype);
};

/**
 *
 * UPDATE subtype
 *
 */
module.exports.update = function (req, res) {

	//merge del subtipo guardado
	var subtypeUpdated = lodash.assign(req.subtype,req.body);
	//guardamos el subtipo modificado
	Subtype.update({_id:req.subtype._id},subtypeUpdated,function (err) {
		if (err) {
			logger.error("Error actualizando subtipo")
			return res
				.status(400)
				.send("Error actualizando subtipo: "+err.errmsg);
		} else {
			logger.info("Actualizado el subtipo "+subtypeUpdated.nombre)
			//devolvemos el subtipo modificado
			return res
				.status(200)
				.json(subtypeUpdated);
		}
	});
};//exports update

/**
 *
 * DELETE subtype
 *
 */
module.exports.delete = function (req, res) {
	//recogemos el subtipo ByID
	var subtype = req.subtype;
	//borramos el subtipo
	subtype.remove(function (err) {
		if (err) {
			logger.error("Error borrando subtipo")
			return res
				.status(400)
				.send("Error borrando subtipo: "+err.errmsg);
		} else {
			logger.info("Borrado subtipo "+subtype.nombre)
			return res
				.status(200)
				.json(req.subtype);
		}
	});
};//exports delete

/**
 *
 * LIST subtypes
 *
 */
module.exports.list = function (req, res) {
	//buscamos todos los subtipos ordenados por fecha
	Subtype.find().sort('nombre').populate('tipo').exec(function (err, subtypes) {
		if (err) {
			logger.error("Error buscando subtipos")
			return res
				.status(400)
				.send("Error buscando subtipos: "+err.errmsg);
		} else {
			//devolvemos todos los subtipos
			return res
				.status(200)
				.json(subtypes);
		}
	});
};//exports list


/**
 *
 * TYPE middleware
 *
 */
module.exports.subtypeByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		log.error("El ID del subtipo no es valido")
		return res
			.status(400)
			.send("El ID del subtipo no es valido");
	}
	//busca el subtipo mediante _id
	Subtype.findById(id).exec(function (err, subtype) {
		if (err) {
			log.error("Error buscando subtipos por ID")
			return next(err);
		} else if (!subtype) {
			log.warn("No hay subtipos con el id: "+id)
			return res
				.status(404)
				.send("No hay subtipos con el id: "+id);
		}
		//guardamos en req.subtype el subtipo
		req.subtype = subtype;
		//sigue
		next();
	});
};//exports subtypeByID