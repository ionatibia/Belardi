var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	nombre:{type:String},
	apellido:{type:String},
	numero:{type:Number},
	identificacion:{type:String, default:null},
	correo:{type:String},
	telefono:{type:Number},
	password:{type:String},
	fecha_alta:{type:Date},
	fecha_baja:{type:Date, default:null},
	consumo_mensual:{type:Number,default:0}
});

module.exports = mongoose.model('User', userSchema);