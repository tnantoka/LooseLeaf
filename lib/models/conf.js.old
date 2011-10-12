/* Wrap config.json */

var fs = require('fs'),
  join = require('path').join;

var conf;

exports.get = function(siteDir) {
  // Singleton
  if (!conf) {
    conf = JSON.parse(fs.readFileSync(join(siteDir, 'config.json')));
  }
  return conf;
};

exports.store = function(siteDir, conf) {
  JSON.parse(fs.writeFileSync(join(siteDir, 'config.json'), JSON.stringify(conf, null, '\t'), 'UTF-8'));
};

