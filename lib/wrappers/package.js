/* Wrapper of package.json */

var fs = require('fs');
var path = require('path');

var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '/../../package.json')));

module.exports.version = pkg.version;
module.exports.codeName = 'Dog-ear';

