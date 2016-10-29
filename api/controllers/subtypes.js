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
var log4js = require('log4js');
//var log4js2 = require('log4js');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/subtype.log', category: 'subtype' },
	  ]
	});
    
var log = log4js.getLogger('subtype');
//var logAjuste = log4js.getLogger('ajuste');

/**
 *
 * CREATE subtype
 *
 */
exports.create = function (req, res) {
	console.log(req.body)

	var subtype = new Subtype(req.body)
	console.log(subtype)

	subtype.save(function (err) {
		if (err) {
			log.error("Error guardando subtipo: "+err)
			return res
				.status(400)
				.send("Error guardando subtipo: "+err)
		} else {
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
			log.error("Error actualizando subtipo: "+err)
			return res
				.status(400)
				.send("Error actualizando subtipo: "+err);
		} else {
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
			log.error("Error borrando subtipo: "+err)
			return res
				.status(400)
				.send("Error borrando subtipo: "+err);
		} else {
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
	Subtype.find().sort('-nombre').exec(function (err, subtypes) {
		if (err) {
			log.error("Error buscando subtipos: "+err)
			return res
				.status(400)
				.send("Error buscando subtipos: "+err);
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
			log.error("Error buscando subtipos por ID: "+err)
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