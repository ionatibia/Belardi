var crypto = require('crypto')

exports.encriptar = function(user,pass, next) {  
	var hmac = crypto.createHmac('sha1',user).update(pass).digest('hex');
	return hmac
}