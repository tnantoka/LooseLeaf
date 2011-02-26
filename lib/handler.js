/* Request handler */

exports.init = function(siteDir) {

	var that = {};
	
	that.hello = function(req, res) {
		res.send('Hello, looseleaf!');
	};
	
	return that;
};