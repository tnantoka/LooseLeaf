/*
 * Start looseleaf
 */

/* Load modules */
var looseleaf = require('looseleaf');

/* Create express server and exports for spark */
var ll = looseleaf.init(__dirname);
exports = ll.app;

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
  ll.listen(port, isDaemon);
}