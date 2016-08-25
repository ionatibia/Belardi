
module.exports = function () {

	

	log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'logs/products.log', category: 'products' }
	  ]
	});	
}


