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
	nombre:{type:String,required: 'Please fill in a nombre'},
	apellido:{type:String},
	numero:{type:Number,required: 'Please fill in a numero',unique: 'Number already exists'},
	identificacion:{type:String, default:null},
	correo:{type:String,required: 'Please fill in a correo',validate: [validateLocalStrategyEmail, 'Please fill a valid email address']},
	telefono:{type:Number},
	password:{type:String},
	fecha_alta:{type:Date, default:Date.now()},
	fecha_baja:{type:Date, default:null},
	consumo_mensual:{type:Number,default:0}
});

module.exports = mongoose.model('User', userSchema);