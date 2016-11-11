var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');

var subSchema = mongoose.Schema({
	cantidad:{type:Number, default:0},
	fecha:{type:Date,default:Date.now()},
	observaciones:{type:String,default:''}
})

var productSchema = new Schema({
	nombre:{type:String,required: 'Falta el nombre'},
	descripcion:{type:String},
	//ambito:{type:String,required: 'Falta el ámbito del producto'},
	tipo:{type:Schema.ObjectId,ref:'Type', required: 'Falta el tipo'},
	subtipo:{type:Schema.ObjectId,ref:'Subtype'},
	variedad:{type:Schema.ObjectId,ref:'Variety'},
	precio:{type:Number, required: 'Falta el precio'},
	iva:{type:Number,required:'Falta el IVA'},
	stock:[subSchema],
	fecha_alta:{type:Date, default:Date.now()},
	baja:{type:Boolean,default:false}
});

module.exports = mongoose.model('Product', productSchema);