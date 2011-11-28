var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(models) {

  this.index = function(req, res, next) {
    models.Comment.findAll(function(err, comments) {
      if (err) return next(err);
      res.send(JSON.stringify(comments));
    });
  };
 
  this.create = function(req, res, next) {
    models.Comment.save(req.body.comment, function(err, comment) {
      if (err) return next(err);
      res.send(JSON.stringify(comment));
    });
  };
 
  this.destroy = function(req, res, next) {
    if (req.post.user.id != req.session.user.id && !req.session.user.isAdmin) return res.send(401);
    models.Comment.remove(req.params.commentId, function(err, file) {
      if (err) return next(err);
      res.send(200);
    });
  };
   return this;

}.bind({});

