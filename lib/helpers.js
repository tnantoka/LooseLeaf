var util = require('util');

module.exports = function(app, config) {

  app.helpers({
  });
 
  app.dynamicHelpers({
    // As dynamic to call without "()" 
    config: function(req, res) {
      return config;
    },
    req: function(req, res) {
      return req;
    }
  });

};

