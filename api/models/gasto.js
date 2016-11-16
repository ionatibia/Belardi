var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var gastoSchema = new Schema({
	tipo:{type:String,required:'Falta el tipo de gasto'},
	fecha:{type:Date},
	numeroFactura:{type:String},
	descripcion:{type:String},
	cantidad:{type:Number, required: 'Falta la cantidad'},
	iva:{type:Number}
});

module.exports = mongoose.model('Gasto', gastoSchema);