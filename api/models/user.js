var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


/**
* A Validation function for local strategy properties
*/
var validateLocalStrategyProperty = function (property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
* A Validation function for local strategy email
*/
var validateLocalStrategyEmail = function (email) {
	return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};


var userSchema = new Schema({
	tipo:{type:String,required: 'Please fill in a tipo'},
	nombre:{type:String,required: 'Please fill in a nombre'},
	apellido:{type:String},
	numero:{type:String,required: 'Please fill in a numero',unique: 'Number already exists'},
	dni:{type:String,required: 'Please fill in a DNI', unique: 'DNI already exists'},
	identificacion:{type:String, default:null},
	correo:{type:String,required: 'Please fill in a correo',validate: [validateLocalStrategyEmail, 'Please fill a valid email address'], unique:'Email already exists', lowercase: true},
	telefono:{type:Number},
	password:{type:String},
	fecha_alta:{type:Date, default:Date.now()},
	fecha_baja:{type:Date, default:null},
	consumo_mensual:{type:Number,default:0},
	cuota:{type:Number,default:0}
});

module.exports = mongoose.model('User', userSchema);