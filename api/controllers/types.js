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
var log4js = require('log4js');
//var log4js2 = require('log4js');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/type.log', category: 'type' },
	  ]
	});
    
var log = log4js.getLogger('type');
//var logAjuste = log4js.getLogger('ajuste');

/**
 *
 * CREATE type
 *
 */
exports.create = function (req, res) {
	console.log(req.body)

	var type = new Type(req.body)
	console.log(type)

	type.save(function (err) {
		if (err) {
			log.error("Error guardando tipo: "+err)
			return res
				.status(400)
				.send("Error guardando tipo: "+err)
		} else {
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
			log.error("Error actualizando tipo: "+err)
			return res
				.status(400)
				.send("Error actualizando tipo: "+err);
		} else {
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
			log.error("Error borrando tipo: "+err)
			return res
				.status(400)
				.send("Error borrando tipo: "+err);
		} else {
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
	Type.find().sort('-nombre').exec(function (err, types) {
		if (err) {
			log.error("Error buscando tipos: "+err)
			return res
				.status(400)
				.send("Error buscando tipos: "+err);
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
		log.error("El ID del tipo no es valido")
		return res
			.status(400)
			.send("El ID del tipo no es valido");
	}
	//busca el tipo mediante _id
	Type.findById(id).exec(function (err, type) {
		if (err) {
			log.error("Error buscando tipos por ID: "+err)
			return next(err);
		} else if (!type) {
			log.warn("No hay tipos con el id: "+id)
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