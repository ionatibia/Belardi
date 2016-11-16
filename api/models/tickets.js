var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');

var subSchema = mongoose.Schema({
	producto:{type:Schema.ObjectId,ref:'Product'},
	cantidad:{type:Number}
})

var ticketSchema = new Schema({
	fecha:{type:Date},
	usuario:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de usuario'},
	socio:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de socio'},
	dispensa:[subSchema],
	firmaUrl:{type:String, required:'Obligatorio firma del socio'},
	neto:{type:Number,required:'Obligatorio precio neto'},
	iva:{type:Number,required:'Obligatorio iva'}
});

module.exports = mongoose.model('Ticket', ticketSchema);