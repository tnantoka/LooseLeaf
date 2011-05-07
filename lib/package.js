/* Wrap package.json */

var fs = require('fs');
var package = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
var CODE_NAME = 'Crayon';

/* Get version */
module.exports.version = function() {
  return package.version
}

/* Get codename */
module.exports.codeName = function() {
  return CODE_NAME;
}
