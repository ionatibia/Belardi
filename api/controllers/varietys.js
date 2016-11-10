'use strict';
/**
 *
 * Module dependencies
 *
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Variety = mongoose.model('Variety'),
	lodash = require('lodash');
//log
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/varietyes.log' })
    ]
});

/**
 *
 * CREATE variety
 *
 */
exports.create = function (req, res) {
	var variety = new Variety(req.body)

	variety.save(function (err) {
		if (err) {
			logger.error("Error guardando la variedad")
			return res
				.status(400)
				.send("Error guardando la variedad: "+err.errmsg)
		} else {
			logger.info("Creada la variedad "+variety.nombre)
			return res
				.status(200)
				.json(variety);
		}
	});
};//exports create

/**
 *
 * SHOW variety byID
 *
 */
module.exports.find = function (req, res) {
	res.json(req.variety);
};

/**
 *
 * UPDATE variety
 *
 */
module.exports.update = function (req, res) {

	//merge de la variedad guardado
	var varietyUpdated = lodash.assign(req.variety,req.body);
	//guardamos la variedad modificada
	Variety.update({_id:req.variety._id},varietyUpdated,function (err) {
		if (err) {
			logger.error("Error actualizando la variedad")
			return res
				.status(400)
				.send("Error actualizando la variedad: "+err.errmsg);
		} else {
			logger.info("Actualizada la variedad "+varietyUpdated.nombre)
			//devolvemos la variedad modificado
			return res
				.status(200)
				.json(varietyUpdated);
		}
	});
};//exports update

/**
 *
 * DELETE variety
 *
 */
module.exports.delete = function (req, res) {
	//recogemos la variedad ByID
	var variety = req.variety;
	//borramos la variedad
	variety.remove(function (err) {
		if (err) {
			logger.error("Error borrando la variedad")
			return res
				.status(400)
				.send("Error borrando la variedad: "+err.errmsg);
		} else {
			logger.info("Borrada la variedad "+variety.nombre)
			return res
				.status(200)
				.json(req.variety);
		}
	});
};//exports delete

/**
 *
 * LIST varietys
 *
 */
module.exports.list = function (req, res) {
	//buscamos todas las variedades ordenadas
	Variety.find().sort('-nombre').populate('tipo').populate('subtipo').exec(function (err, varietys) {
		if (err) {
			logger.error("Error buscando variedades")
			return res
				.status(400)
				.send("Error buscando variedades: "+err.errmsg);
		} else {
			//devolvemos todos los variedads
			return res
				.status(200)
				.json(varietys);
		}
	});
};//exports list


/**
 *
 * TYPE middleware
 *
 */
module.exports.varietyByID = function (req, res, next, id) {
	//si el _id no es un objeto mongo valido
	if (!mongoose.Types.ObjectId.isValid(id)) {
		logger.error("El ID de la variedad no es valido")
		return res
			.status(400)
			.send("El ID de la variedad no es valido");
	}
	//busca la variedad mediante _id
	Variety.findById(id).exec(function (err, variety) {
		if (err) {
			logger.error("Error buscando la variedads por ID")
			return next(err);
		} else if (!variety) {
			logger.warn("No hay variedads con el id: "+id)
			return res
				.status(404)
				.send("No hay variedads con el id: "+id);
		}
		//guardamos en req.variety la variedad
		req.variety = variety;
		//sigue
		next();
	});
};//exports varietyByID