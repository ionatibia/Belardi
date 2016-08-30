var mongoose = require('mongoose');
var Schema = mongoose.Scema;
var validator = require('validator');

var subSchema = mongoose.Schema({
	producto:{type:Schema.ObectId,ref:'Product'},
	cantidad:{type:Number}
})

var ticketSchema = new Schema({
	hora:{type:Date, default:Date.now()},
	usuario:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de usuario'},
	socio:{type:Schema.ObjectId,ref:'User',required:'Obligatorio numero de socio'},
	dispensa:[subSchema],
	firmaUrl:{type:String,required:'Obligatorio firma del socio'}
})