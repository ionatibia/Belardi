// auth.js
var mongoose = require('mongoose');  
var User = require('../models/user'); 
//para crear el token
var service = require('./services');
//encriptar password
var crypto = require('./crypto');

//esto es solo para crear usuarios para tener alguno de prueba
exports.emailSignup = function(req, res) {
    var pass = crypto.encriptar(req.body.correo,req.body.password);
    var user = new User({
        nombre:req.body.nombre,
        correo:req.body.correo,
        password:pass
    });

    user.save(function(err){
        if (err) {
            return res
                .status(400)//bad request
                .send("fallo al guardar usuario")
        }
        return res
            .status(200)//ok
            .send({token: service.createToken(user)});
    });
};


//login normal (en tu caso en la función del passport)
exports.emailLogin = function(req, res) { 
    var pass = crypto.encriptar(req.body.correo,req.body.password);

    User.findOne({correo: req.body.correo.toLowerCase()}, function(err, user) {
        if (user) {
            if (user.password === pass) {
                //si se loguea correctamente enviamos el token al cliente
                return res
                    .status(200)//ok
                    //enviamos el token al cliente para que lo guarde y lo utilice en cada peticion
                    .send({token: service.createToken(user)});
            }
        }else{
            return res
                .status(204)//no content
                .send("usuario no existe");
        }
    });
};