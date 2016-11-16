var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var typeSchema = new Schema({
	nombre:{type:String,required: 'Falta el nombre', unique:'Tipo repetido'},
	descripcion:{type:String},
	//ambito:{type:String, required: 'Falta el ámbito'},
	fecha_alta:{type:Date}
});

module.exports = mongoose.model('Type', typeSchema);