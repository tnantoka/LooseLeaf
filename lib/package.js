/* Wrap package.json */

var fs = require('fs');
var package = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'UTF-8'));

/* Get version */
module.exports.version = function(siteDir) {
  return package.version
}
