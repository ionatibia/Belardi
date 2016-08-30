var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');

var subSchema = mongoose.Schema({
	producto:{type:Schema.ObjectId,ref:'Product'},
	cantidad:{type:Number}
})

var ticketSchema = new Schema({
	fecha:{type:Date, default:Date.now()},
	usuario:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de usuario'},
	socio:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de socio'},
	dispensa:[subSchema],
	firmaUrl:{type:String,required:'Obligatorio firma del socio'}
});

module.exports = mongoose.model('Ticket', ticketSchema);