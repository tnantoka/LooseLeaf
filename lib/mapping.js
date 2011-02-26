/* Mapping URI */

exports.map = function(app, handler) {

	app.get('/hello', handler.hello);

};
