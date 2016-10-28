// server.js
var express = require('express');  
var bodyParser = require('body-parser');  
var mongoose = require('mongoose');  
var cors = require('cors');  
var config = require('./controllers/security/config');
var chalk = require('chalk');
var startConfog = require('./controllers/security/start');
var path = require('path');

// Configuramos Express
var app = express();
app.use(bodyParser.urlencoded({extended: true}));  
app.use(bodyParser.json());  
 
app.use(cors());

app.use('/public',express.static(__dirname + '/public'));

/*app.use(function(req,res,next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
})*/

//Modelos
config.files.server.models.forEach( function(modelsPath) {
	require(path.resolve(modelsPath))
});

//Rutas
config.files.server.routes.forEach( function(routesPath) {
	require(path.resolve(routesPath))(app)
});

/***********servidor***************/
var server = require('http').Server(app);
app.io = require('socket.io')(server);

mongoose.connect('mongodb://'+ config.server.db.uri, function(err) {  
	if (err) {
		console.log(chalk.red("Error conectando a la base de datos: " + err))
	}
    server.listen(config.server.server_port, config.server.server_ip, function() { 
	  console.log(chalk.green("Listening on " + config.server.server_ip + ", server port " + config.server.server_port));
	});
});