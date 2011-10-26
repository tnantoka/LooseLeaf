//var persistence = require('../ext/persistencejs/lib/persistence').persistence;
var async = require('async');

module.exports = function(models) {

  this.index = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.User.all(session).list(tx, function(users) {
        async.forEach(users, function(user, cb) {
          user.posts.list(tx, function(posts) {
            user.posts.length = posts.length
            cb();
          });
        }, function(err) {
          if (err) throw err;
          res.render('users/index', {
            title: 'Users',
            users: users
          });
          session.close();
        });
      });
    });
  }

  this.loadUser = function(req, res, next, id) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.User.findBy(session, tx, 'id', req.params.userId, function(user) {
        if (!user) return res.send(404);
        session.close();
        req.user = user;
        next();
      });
    });
  };

  this.show = function(req, res, next) {
    res.render('users/show', {
      title: req.user.username,
      user: req.user
    });
  };

  this.edit = function(req, res, next) {
    if (req.user.username != req.session.user.username && !req.session.user.is_admin) return res.send(401);
    var session = models.getSession();
    session.transaction(function(tx) {

      for (var i in req.body.user) {
        if (req.body.user[i]) {
          req.user[i] = req.body.user[i];
        }
      }
      req.user.updated_at = new Date();

      session.add(req.user);
      session.flush(tx, function() {
        // TODO: use last insert id
        models.User.all(session).filter('updated_at', '=', req.user.updated_at).one(tx, function(user) {
          user.posts.list(tx, function(posts) {
            user.posts.length = posts.length
            res.render('shared/_user', { 
              user: user,
              layout: false
            });
            session.close();
          });
        });
      });
    });
  };

  this.create = function(req, res, next) {
    var session = models.getSession();
    var user = new models.User(req.body.user);
    user.created_at = new Date();
    session.add(user);
    session.transaction(function(tx) {
      session.flush(tx, function() {
        models.User.all(session).filter('created_at', '=', user.created_at).one(tx, function(user) {
          user.posts.length = 0;
          res.render('shared/_user', { 
            user: user,
            layout: false
          });
          session.close();
        });
      });
    });
  };
 
  return this;

}.bind({});

