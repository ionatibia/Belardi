var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var productSchema = new Schema({
	nombre:{type:String,required: 'Falta el nombre'},
	descripcion:{type:String},
	tipo:{type:Schema.ObjectId,ref:'Type', required: 'Falta el tipo'},
	subtipo:{type:Schema.ObjectId,ref:'Subtype', required:'Falta el subtipo'},
	variedad:{type:Schema.ObjectId,ref:'Variety'}
	precio:{type:Number, required: 'Falta el precio'},
	iva:{type:Number,required:'Falta el IVA'},
	stock:{type:Number,default:0},
	fecha_alta:{type:Date, default:Date.now()}
});

module.exports = mongoose.model('Product', productSchema);