'use strict';
var glob = require('glob');
var	mongoose = require('mongoose');
var	User = require('../../models/user');
var	config = require('./config.js');
var	lodash = require('lodash');
var	chalk = require('chalk');
var	path = require('path');
var	fs = require('fs');

/**
 *
 * Get files by glob patterns
 *
 */
var getGlobbedPaths = function (globPatterns, excludes) {
	//URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	//Output array
	var output = [];

	//If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
	if (Array.isArray(globPatterns)) {
		globPatterns.forEach( function(globPatterns) {
			output = lodash.union(output, getGlobbedPaths(globPatterns, excludes));
		});
	} else if (lodash.isString(globPatterns)) {
		if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
		} else{
			var files = glob.sync(globPatterns);
			if (excludes) {
				files = files.map(function (file) {
					if (_.isArray(excludes)) {
						for (var i in excludes) {
							file = file.replace(excludes[i], '');
						}
					} else{
						file = file.replace(excludes, '');
					}
					return file;
				})
			}
			output = lodash.union(output,files);
		}
	}
	return output;
}//function getGlobbedPaths

/**
 *
 * Initialize global configuration files
 *
 */
var initGlobalConfigFiles = function (config,assets) {
	//Appending files
	config.files = {
		server: {}
	}

	//Setting Globbed model files
	config.files.server.models = getGlobbedPaths(config.server.models);

	//Setting Globbed route files
	config.files.server.routes = getGlobbedPaths(config.server.routes);

	//Setting Globbed policies files
	config.files.server.policies = getGlobbedPaths(config.server.policies);

}//function initGlobalConfigFiles

/**
 *
 * Initialize global configuration
 *
 */
var initGlobalConfig = function () {

	//Get the default assets
	var assets = require(path.join(process.cwd(), 'controllers/security/config'));

	//Get the default config
	var config = require(path.join(process.cwd(), 'controllers/security/config'));

	//Initialize global globbed files
	initGlobalConfigFiles(config,assets);

	//Expose configurations utilities
	config.utils = {
		getGlobbedPaths: getGlobbedPaths,
	}

	//crear usuario admin por defecto
	User.findOne({nombre: 'admin'}, function(err, user) {
        if (!user) {
			var user = new User({
		        nombre: config.server.adminUser.nombre,
		        apellido: config.server.adminUser.apellido,
		        numero: config.server.adminUser.numero,
		        correo: config.server.adminUser.correo,
		        telefono: config.server.adminUser.telefono,
		        password: config.server.adminUser.password,
		    });

   			user.save(function(err){
		        if (err) {
		            console.log(chalk.red("No se ha pododo guardar el usuario por defecto"));
		            console.log(chalk.red("Error: "+err));
		            console.log(chalk.white(''));
		        } else {
		        	console.log(chalk.green("Creado el usuario por defecto"));
		        	console.log(chalk.white(''));
		        }
    		});
        } else {
        	console.log(chalk.green("Usuario por defecto ya creado anteriormente"));
        }
    });

	return config;

}//function initGlobalConfig
module.eports = initGlobalConfig();