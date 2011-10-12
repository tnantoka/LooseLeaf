/* Wrapper of package.json */

var fs = require('fs');
var path = require('path');

module.exports = function() {

  this.version = JSON.parse(fs.readFileSync(path.join(__dirname, '/../../package.json'))).version;
  this.codeName = 'Dog-ear';

  return this;

}.bind({});

