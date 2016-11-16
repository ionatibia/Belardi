var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var ingresoSchema = new Schema({
	tipo:{type:String,required:'Falta el tipo de ingreso'},
	numeroFactura:{type:String},
	fecha:{type:Date},
	descripcion:{type:String},
	cantidad:{type:Number, required: 'Falta la cantidad'},
	iva:{type:Number,default:0},
});

module.exports = mongoose.model('Ingreso', ingresoSchema);