/* Wrap conf.json */

var fs = require('fs'),
  join = require('path').join;

var conf;

exports.get = function(siteDir) {
  // Singleton
  if (!conf) {
    conf = JSON.parse(fs.readFileSync(join(siteDir, 'conf.json'), 'UTF-8'));
  }
  return conf;
}