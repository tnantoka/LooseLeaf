/* Wrap package.json */

var fs = require('fs');
var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));

var CODE_NAME = 'Dog-ear';

/* Get version */
module.exports.version = function() {
  return packageJson.version
}

/* Get codename */
module.exports.codeName = function() {
  return CODE_NAME;
}
