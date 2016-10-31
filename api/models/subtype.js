var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var subtypeSchema = new Schema({
	nombre:{type:String,required: 'Falta el nombre', unique:'Nombre repetido'},
	descripcion:{type:String},
	tipo:{type:Schema.ObjectId,ref:'Type', required: 'Falta el tipo'},
	fecha_alta:{type:Date, default:Date.now()}
});

module.exports = mongoose.model('Subtype', subtypeSchema);