// server.js
var express = require('express');  
var bodyParser = require('body-parser');  
var mongoose = require('mongoose');  
var cors = require('cors');  
var auth = require('./controllers/auth');  
var middleware = require('./controllers/middleware');

// Configuramos Express
var app = express();  
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({extended: true}));  
app.use(cors());  

/***********servidor***************/
var server = require('http').Server(app);
app.io = require('socket.io')(server);
var server_port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1';


// Rutas de autenticación y login
app.post('/auth/signup', auth.emailSignup); // para crear usuario
app.post('/auth/login', auth.emailLogin); //para logearse

// Ruta solo accesible si estás autenticado
app.get('/private',middleware.ensureAuthenticated, function(req, res) {
	res.send(req.user);//_id del usuario si el token es correcto
} );




mongoose.connect('mongodb://localhost/belardi', function(err) {  
    server.listen(server_port,server_ip_address, function() { 
	  console.log("Listening on " + server_ip_address + ", server_port " + server_port);
	  console.log("Listening on port " + server_port);
	});
});