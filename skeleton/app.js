/*
 * Start looseleaf
 */

/* Load modules */
var daemon = require('daemon'),
	looseleaf = require('looseleaf');

/* Create express server and exports for spark */
var ll = module.exports = looseleaf.init(__dirname);
var app = ll.app;
var conf = ll.conf;

/* Parse arguments */
var args = process.argv.slice(2);
var port = 3000;
var isDaemon;
while (args.length) {
	switch (args.shift()) {
		case '-p':
		case '--port':
			port = args.shift();
			break;
		case '-d':
		case '--daemon':
			isDaemon = true;
			break;
		default:
			console.error('Usage: node app.js [--port 3000] [--daemon]');
			process.exit(1);
	}
}

/* Only listen on $ node app.js */
if (!module.parent) {
	app.listen(port);

	console.log('"' + conf.site.name + '" server listening on port %d', app.address().port);
	
//	if (Conf.site.password == 'pass') {
	console.log('[warning] Your password is default! Please change immediately!!');
//	}

	if (isDaemon) {
		daemon.daemonize('logs/looseleaf.log', 'logs/looseleaf.pid', function (err, pid) {
			if (err) {
				console.error('Error starting daemon: ' + err);
			} else {
				console.log('Daemon started successfully with pid: ' + pid);
			}
		});
	}
}