var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(models) {

  this.index = function(req, res, next) {
    models.File.findAll(function(err, files) {
      if (err) return next(err);
      res.send(JSON.stringify(files));
    });
  };
 
  this.create = function(req, res, next) {
    req.form.complete(function(err, fields, files) {
      if (err) return next(err);
      models.File.save(files.files.path, files.files.filename, req.session.user, function(err, file) {
        if (err) return next(err);
        models.File.findAll(function(err, files) {
          if (err) return next(err);
          res.send(JSON.stringify(files));
        });
      });
    });
  };
 
  this.destroy = function(req, res, next) {
    models.File.remove(req.params.filename, req.session.user, function(err, file) {
      if (err) return next(err);
      res.send(200);
    });
  };
   return this;

}.bind({});

