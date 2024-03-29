'use strict';

var authController = require('../controllers/auth.js');
var middleware = require('../controllers/middleware');

module.exports = function (app) {

	// Rutas de autenticación y login
	app.post('/auth/signup', middleware.ensureAuthenticated, authController.emailSignup); // para crear usuario
	app.post('/auth/login', authController.emailLogin); //para logearse

	//Rutas usuarios
	app.get('/auth/users', middleware.ensureAuthenticated, authController.emailList);
	app.get('/auth/users/:userId', middleware.ensureAuthenticated, authController.emailFind);
	app.put('/auth/users/:userId', middleware.ensureAuthenticated, authController.emailUpdate);
	app.delete('/auth/users/:userId', middleware.ensureAuthenticated, authController.emailDelete);
	app.post('/auth/users/baja/:userId', middleware.ensureAuthenticated, authController.baja);
	app.post('/auth/users/alta/:userId', middleware.ensureAuthenticated, authController.alta);

	//Finish by binding the article middleware
	app.param('userId', authController.userByID);
}