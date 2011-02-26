/* Mapping URI */

// Setting handler function
function setHandler(handler, config) {
	return function(req, res) {
		var result = handler(req, res);
		var action = config[result.status];
		switch (action.type) {
			case 'render':
				res.render(action.view, { locals: result.locals });				
				break;
			case 'redirect':
				res.redirect(action.target);				
				break;					
		}
	};
}
	
exports.map = function(app, handler) {

	/* Test */
	app.get('/hello', setHandler(handler.hello, {
			OK: {type: 'render', view: 'hello'},
	}));

	/* Public */
	var TOP = '/index/0/';
	app.get('/', setHandler(function() { return { status: 'TOP' } }, {
			TOP: {type: 'redirect', target: TOP}
	}));
	app.get('/index/:offset/', setHandler(handler.index, {
			OK: {type: 'render', view: 'index'},
			NG: {type: 'redirect', target: TOP}
	}));
	app.get('/entry/:id/', setHandler(handler.entry, {
			OK: {type: 'render', view: 'entry'},
			NG: {type: 'redirect', target: TOP}
	}));

	/* Admin */

};
