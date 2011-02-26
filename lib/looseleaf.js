/*
 * LooseLeaf: Lightweight blogging engine for node.js
 * https://looseleafjs.org/
 */

/* Load modules */
var fs = require('fs'),
	express = require('express'),
	form = require('connect-form'),
	join = require('path').join;

/* Define constants */
var BASE_DIR = join(__dirname, '..');
var VERSION = require('./package').version();

/* Create looseleaf server */
module.exports.init = function(siteDir) {

	/* Create express server */
	var app = express.createServer(
		// For uploading files
		form({ keepExtensions: true })
	);

	/* Load JSON files */
	var conf = require('./conf').get(siteDir);

	/* Configure app */
	app.configure(function() {
		// Combined Log Format
		app.use(express.logger({ format: ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :response-time ":referrer" ":user-agent"' }));

		// Set view directory
		app.set('views', join(siteDir, 'data/views'));	
		// Set templete engine
		app.set('view engine', 'ejs');

		// Set static directory
		app.use(express.staticProvider(join(siteDir, 'public')));

		// For session support
		app.use(express.cookieDecoder());
		app.use(express.session({secret: 'looseleafjs'}));

		// Parse HTTP
		app.use(express.bodyDecoder());
		app.use(express.methodOverride());

		// session.regenerate() error occurs
		//	app.use(app.router);
	});

	// development mode(Default)
	app.configure('development', function() {
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	});

	// production mode($ NODE_ENV=production node app.js)
	app.configure('production', function() {
		app.use(express.errorHandler()); 
	});

	/* Logic */
	var handler = require('./handler').init(siteDir);
	require('./mapping').map(app, handler);

	/* Return for app.js */
	return {
		app: app,
		conf: conf
	};
};
