var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');


var totalSchema = new Schema({
	fecha:{type:Date},
	cantidad:{type:Number, required: 'Falta la cantidad'}
});

module.exports = mongoose.model('Total', totalSchema);