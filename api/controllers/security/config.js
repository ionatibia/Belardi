var crypto = require('../crypto');
var correoAdmin = 'natiexperiencia@gmail.com'
var passwordEncriptada = crypto.encriptar(correoAdmin,'Nati/Experiencia666000')
// config.js
module.exports = {  
  TOKEN_SECRET: process.env.TOKEN_SECRET || "belardi2016Nati2016Arrobinet2016",
  server: {
  	server_port: process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8000,
  	server_ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || 'localhost',
  	//server_ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '192.168.0.5',
  	//server_ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || 'belardi.zapto.org',
  	db:{
  		uri: process.env.MONGO_URI || 'localhost' + '/belardi',
  		user: '',
  		pass:''
  	},
  	models: 'models/*.js',
	controllers: 'controllers/*.js',
	policies: 'policies/*.js',
	routes: 'routes/*.js',
	adminUser: {
		tipo:'Normal',
		nombre:'admin',
		apellido:'istrador',
		numero:0,
		correo:correoAdmin,
		telefono:635758566,
		password:passwordEncriptada,
		dni:'00000000A'
	}
  }
};