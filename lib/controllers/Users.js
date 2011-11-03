//var persistence = require('../ext/persistencejs/lib/persistence').persistence;
var async = require('async');

module.exports = function(models) {

  this.index = function(req, res, next) {
    console.log('users#index');
    var flag = req.session.user ? null : false;
    models.User.findByIsPrivate(flag, function(err, users) {
      if (!users) return res.send(404);
      res.render('users/index', {
        title: 'Users',
        users: users
      });
    });
  }

  this.loadUser = function(req, res, next, id) {
    var flag = req.session.user ? null : false;
    models.User.findByIdAndIsPrivate(id, flag, function(err, user) {
      if (!user) return res.send(404);
      console.log('loadUser', user);
      req.user = user;
      next();
    });
  };

  this.show = function(req, res, next) {
    res.render('users/show', {
      title: req.user.username,
      users: [req.user]
    });
  };

  this.edit = function(req, res, next) {
    if (req.user.username != req.session.user.username && !req.session.user.isAdmin) return res.send(401);
    for (var i in req.body.user) {
      if (req.body.user[i]) {
        if (req.body.user[i] == 'true') req.body.user[i] = true;
        if (req.body.user[i] == 'false') req.body.user[i] = false;
        req.user[i] = req.body.user[i];
      }
    }
    models.User.save(req.user, function(err, user) {
      if (err) return next(err);
      res.send(JSON.stringify(user));
    });
  };

  this.create = function(req, res, next) {
    if (!req.session.user.isAdmin) return res.send(401);
    models.User.save(req.body.user, function(err, user) {
      if (err) return next(err);
      res.send(JSON.stringify(user));
    });
  };
 
  return this;

}.bind({});

