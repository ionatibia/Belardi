var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var productSchema = new Schema({
	nombre:{type:String,required: 'Please fill in a name'},
	descripcion:{type:String},
	tipo:{type:String, required: 'Please fill in a type'},
	subtipo:{type:String, required:'Please fill a subtype'},
	precio:{type:Number, required: 'Please fill a price'},
	iva:{type:Number,required:'Please fill a iva'},
	stock:{type:Number,default:0},
	fecha_alta:{type:Date, default:Date.now()}
});

module.exports = mongoose.model('Product', productSchema);