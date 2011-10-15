/*
 * Start looseleaf server
 */

// Create express server and exports for spark like modules
var ll = require('looseleaf').init(__dirname);

// For other controll modules
exports = ll.app;

// Only listen when run on $ node app.js 
if (!module.parent) {
  ll.start();
}

