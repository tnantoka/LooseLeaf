var async = require('async');

module.exports = function(models) {

  this.index = function(req, res, next) {
    var flag = req.session.user ? null : false;
    models.User.findByIsPrivate(flag, function(err, users) {
      if (!users) return res.send(404);
      res.render('users/index', {
        title: 'Users',
        navUsers: models.User.findAllSync(),
        users: users
      });
    });
  }

  this.loadUser = function(req, res, next, id) {
    var flag = req.session.user ? null : false;
    models.User.findByIdAndIsPrivate(id, flag, function(err, user) {
      if (!user) return res.send(404);
      req.user = user;
      next();
    });
  };

  this.show = function(req, res, next) {
    res.render('users/show', {
      title: req.user.username,
      navUsers: models.User.findAllSync(),
      users: [req.user]
    });
  };

  this.edit = function(req, res, next) {
    if (req.user.id != req.session.user.id && !req.session.user.isAdmin) return res.send(401);
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

