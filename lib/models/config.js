/* Wrapper of config.json */

var fs = require('fs');
var path = require('path');

module.exports = function(dir) {

  var filePath = path.join(dir, 'config.json');
  var config = JSON.parse(fs.readFileSync(filePath));

  this.get = function() {
    return config;
  };

  this.save = function(newConfig, fn) {
    fs.writeFile(filePath, JSON.stringify(newConfig, null, '  '), 'UTF-8', function(err) {
      if (err) return fn(err);
      fn(null);
    });
  };

  // Shortcut to properties
  Object.keys(config).forEach(function(key) {
    this[key] = config[key];
  }.bind(this));

  return this;

}.bind({});

