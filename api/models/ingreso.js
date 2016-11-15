var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var ingresoSchema = new Schema({
	tipo:{type:String,required:'Falta el tipo de ingreso'},
	fecha:{type:Date,default:Date.now()},
	descripcion:{type:String},
	cantidad:{type:Number, required: 'Falta la cantidad'}
});

module.exports = mongoose.model('Ingreso', ingresoSchema);