var log4js = require('log4js');

module.exports = function () {

	log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/product.log', category: 'product' },
	    { type: 'file', filename: 'logs/auth.log', category: 'auth' },
	    { type: 'file', filename: 'logs/ticket.log', category: 'ticket' },
	    { type: 'file', filename: 'logs/contability.log', category: 'auth' },
	    { type: 'file', filename: 'logs/app.log', category: 'app' }
	  ]
	});
}


