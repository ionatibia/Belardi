// auth.js
var mongoose = require('mongoose');  
var User = require('../models/user'); 
//para crear el token
var service = require('./services');
//encriptar password
var crypto = require('./crypto');
//log
var Log = require('simple-node-logger'),
    opts = {
        logFilePath:'./logs/auth.log',
        timestampFormat:'YYYY-MM-DD HH:mm'
    },
    log = Log.createSimpleLogger( opts );

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
    var pass = crypto.encriptar(req.body.correo,req.body.password);

    var user = new User(req.body);
    user.password = pass;

    user.save(function(err){
        if (err) {
            return res
                .status(400)//bad request
                .send("fallo al guardar usuario")
        }
        log.info("Creado el usuario nº:"+user.numero+';')
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
        if (user) {
            if (user.password === pass) {
                log.warn("Accediendo el usuario nº:"+user.numero+';')
                log.warn("Accediendo el usuario nº:"+user.numero+';')
                //si se loguea correctamente enviamos el token al cliente
                return res
                    .status(200)//ok
                    //enviamos el token al cliente para que lo guarde y lo utilice en cada peticion
                    .send({token: service.createToken(user)});
            } else {
                return res
                    .status(404)
                    .send("Contraseña incorrecta")
            }
        }else{
            return res
                .status(204)//no content
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
    //cogemos el usuario desde el ID pasado
    var user = req.usuario;
    //quitamos el password
    delete req.body.password;
    //Merge del usuario pasado y el guardado (solo se guardan los datos nuevos que no sean null
    var userUpdated = lodash.assign(user,req.body);
    //guardamos el usuario modificado
    User.update({_id: user._id},userUpdated,function (err) {
        if (err) {
            return res
                .status(500)
                .send("Error actualizando el usuario: "+err)
        } else {
            log.info("Modificado el usuario nº:"+user.numero+';')
            //devolvemos el usuario modificado
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
        return res
            .status(401)
            .send("No se puede borrar el usuario admin")
    }
    //borramos el usuario
    user.remove(function (err) {
        if (err) {
            return res
                .status(500)
                .send("Error al borrar usuario: "+err)
        } else {
            log.warn("Borrado el usuario nº:"+user.numero+';')
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
            return res
                .status(400)
                .send("Error buscando usuarios: "+err)
        } else {
            //devolvemos los usuarios
            res.json(users);
        }
    });
}

/**
 *
 * FIND BY ID
 *
 */
module.exports.userByID = function (req, res, next, id) {
    //si el _id no es de un objeto de mongo valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'User is invalid'
        });
    }
    //buscamos el usuario mediante ID
    User.findById(id).populate('user', 'displayName').exec(function (err, user) {
        if (err) {
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