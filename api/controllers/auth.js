// auth.js
var mongoose = require('mongoose');  
var User = require('../models/user'); 
//para crear el token
var service = require('./services');
//encriptar password
var crypto = require('./crypto');
//lodash
var lodash = require('lodash');
//log
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'logs/auth.log' })
    ]
});

/**
 *
 * CREATE
 *
 */
exports.emailSignup = function(req, res) {
    if (req.body == undefined) {
        return res
            .status(400)
            .send("Faltan datos")
    }
    if (req.body.password != '' && req.body.password != undefined && req.body.password != null) {
        var pass = crypto.encriptar(req.body.correo,req.body.password);
    }else{
        return res
            .status(400)
            .send("Falta la contraseña")
    }

    var user = new User(req.body);
    user.password = pass;

    user.save(function(err){
        if (err) {
            logger.error("Fallo al guardar usuario: "+user.dni);
            return res
                .status(400)//bad request
                .send("fallo al guardar usuario "+err.errmsg)
        }
        logger.info("Creado el usuario nº:"+user.numero+' DNI: '+user.dni)
        delete user.password;
        return res
            .status(200)//ok
            .send(user);
    });
};

/**
 *
 * LOGIN
 *
 */
exports.emailLogin = function(req, res) { 

    if (req.body.correo == undefined || req.body.password == undefined) {
        return res
            .status(400)
            .send("Faltan datos")
    }
    var pass = crypto.encriptar(req.body.correo,req.body.password);

    User.findOne({correo: req.body.correo.toLowerCase()}, function(err, user) {
        if (err) {
            return res
                .status(400)
                .send("Error buscando usuario para login "+err.errmsg)
        }
        if (user) {
            if (user.password === pass) {
                logger.info("Accediendo el usuario nº:"+user.numero)
                //si se loguea correctamente enviamos el token al cliente
                return res
                    .status(200)//ok
                    //enviamos el token al cliente para que lo guarde y lo utilice en cada peticion
                    .send({token: service.createToken(user)});
            } else {
                logger.warn("Contraseña incorrecta usuario: "+user.numero)
                return res
                    .status(401)
                    .send("Contraseña incorrecta")
            }
        }else{
            logger.info("Peticion de login no existe usuario: "+req.body.correo)
            return res
                .status(401)//no content
                .send("usuario no existe");
        }
    });
};

/**
 *
 * UPDATE
 *
 */
exports.emailUpdate = function (req,res) {
    //comprobamos recibir algun dato
    if (req.body == undefined) {
        return res
            .status(400)
            .send("Faltan datos")
    }
    
    var pass;
    //cogemos el usuario desde el ID pasado
    var user = req.usuario;
    //Merge del usuario pasado y el guardado (solo se guardan los datos nuevos que no sean null
    var userUpdated = lodash.assign(user,req.body);

    if (req.body.password == '' || req.body.password == null || req.body.password == undefined) {
        delete userUpdated.password
    }else{
        pass = crypto.encriptar(req.body.correo,req.body.password);
        userUpdated.password = pass;
    }
    
    //guardamos el usuario modificado
    User.update({_id: user._id},userUpdated,function (err) {
        if (err) {
            logger.error("Error actualizando socio: "+user.dni)
            return res
                .status(400)
                .send("Error actualizando el socio: "+err.errmsg)
        } else {
            logger.info("Modificado el socio: "+user.dni+' por el usuario: '+req.user.dni)
            console.log(userUpdated)
            //devolvemos el usuario modificado
            delete userUpdated.password
            res.json(userUpdated)
        }
    })
}

/**
 *
 * DELETE
 *
 */
exports.emailDelete = function (req,res) {
    //recogemos el usuario desde el ID
    var user = req.usuario;
    //si el username es admin NO lo borramos
    if (req.usuario.username == 'admin') {
        logger.warn("No se puede borar el usuario administrador. Usuario: "+req.user.dni)
        return res
            .status(401)
            .send("No se puede borrar el usuario admin")
    }
    //borramos el usuario
    user.remove(function (err) {
        if (err) {
            logger.error("Error al borrar usuario: "+req.usuario.dni)
            return res
                .status(500)
                .send("Error al borrar usuario: "+err.errmsg)
        } else {
            logger.warn("Borrado el usuario:"+user.dni)
            //devolvemos el usuario borrado
            res.json(user)
        }
    })
}

/**
 *
 * USER FIND
 *
 */
exports.emailFind = function (req,res) {
    //recogemos el usuario por ID
    var user = req.usuario;
    //devolvemos el usuario
    res.json(user)
}

/**
 *
 * LIST USERS
 *
 */
exports.emailList = function (req,res) {
    //buscamos todos los usuarios ordenados alfabeticamente
    User.find().sort({username: 1}).exec(function (err, users) {
        if (err) {
            logger.error("Error buscando usuarios")
            return res
                .status(400)
                .send("Error buscando usuarios: "+err.errmsg)
        } else {
            //devolvemos los usuarios
            res.json(users);
        }
    });
}

exports.baja = function (req,res) {
    User.update({_id: req.usuario},{$set: { numero: 'baja'+req.usuario.dni }},function (err) {
        if (err) {
            logger.error("Error dando de baja al usuario: "+req.usuario.dni)
            return res
                .status(500)
                .send("Error dando de baja al usuario: "+err.errmsg)
        } else {
            logger.info("Dado de baja al usuario: "+req.usuario.dni)
            //devolvemos el usuario modificado
            res.json("baja"+req.usuario.dni)
        }
    })
}

exports.alta = function (req,res) {
    var num = req.body.numero;
    User.update({_id: req.usuario},{$set: { numero: num }},function (err) {
        if (err) {
            logger.error("Error dando de alta al usuario: "+req.usuario.dni)
            return res
                .status(500)
                .send("Error dando de alta al usuario: "+err.errmsg)
        } else {
            logger.info("Dado de alta al usuario: "+req.usuario.dni)
            //devolvemos el usuario modificado
            res.json(num)
        }
    })
}

/**
 *
 * FIND BY ID
 *
 */
module.exports.userByID = function (req, res, next, id) {
    //si el _id no es de un objeto de mongo valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.error("Id de usuario invalida: "+id)
        return res.status(400).send({
            message: 'User is invalid'
        });
    }
    //buscamos el usuario mediante ID
    User.findById(id).populate('user', 'displayName').exec(function (err, user) {
        if (err) {
            logger.error("Error buscando usuario por ID: "+id)
            return next(err);
        } else if (!user) {
            return res.status(404).send({
                message: 'No user with that identifier has been found'
            });
        }
        //guardamos el usuario en req.usuario
        req.usuario = user;
        //sigue
        next();
    });

}