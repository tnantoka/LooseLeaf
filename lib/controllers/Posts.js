//var persistence = require('../ext/persistencejs/lib/persistence').persistence;

module.exports = function(models) {

  this.index = function(req, res, next) {
  }
  
  this.create = function(req, res, next) {
    var session = models.getSession();
    var post = new models.Post(req.body.post);
    post.created_at = new Date();
    session.transaction(function(tx) {
      models.User.load(session, tx, req.session.user.id, function(user) {
        post.user = user;
        session.add(post);
        session.flush(tx, function() {
          //models.Post.all(session).filter('title', '=', req.body.post.title).prefetch('user').one(tx, function(post) {
          models.Post.all(session).filter('created_at', '=', post.created_at).prefetch('user').one(tx, function(post) {
            res.render('shared/_post', { 
              post: post,
              layout: false
             });
            session.close();
          });
        });
      });
    });
  };

  this.loadPost = function(req, res, next, id) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).filter('id', '=', id).prefetch('user').one(tx, function(post) {
        session.close();
        if (!post) return res.send(404);
        req.post = post;
        next();
      });
    });
  };

  this.show = function(req, res, next) {
    res.render('posts/show', {
      title: req.post.title,
      posts: req.post
    });
  };
  
  this.edit = function(req, res, next) {
    if (req.post.user.username != req.session.user.username) return res.send(401);
    var session = models.getSession();
    session.transaction(function(tx) {
      // TODO: use jquery.extends ?
/*
      req.post.title = req.body.post.title;
      req.post.body = req.body.post.body;
      req.post.tag = req.body.post.tag;
*/
      for (var i in req.body.post) {
        req.post[i] = req.body.post[i];
      }
      req.post.updated_at = new Date();

      session.add(req.post);
      session.flush(tx, function() {
        // TODO: use last insert id
        //models.Post.all(session).filter('title', '=', req.body.post.title).prefetch('user').one(tx, function(post) {
        models.Post.all(session).filter('updated_at', '=', req.post.updated_at).prefetch('user').one(tx, function(post) {
          res.render('shared/_post', { 
            post: post,
            layout: false
          });
          session.close();
        });
      });
    });
  };

  this.destroy = function(req, res, next) {
    if (req.post.user.username != req.session.user.username) return res.send(401);
    var session = models.getSession();
    session.transaction(function(tx) {
      session.remove(req.post);
      session.flush(tx, function() {
        res.send(200);
        session.close();
      });
    });
  };

  return this;

}.bind({});

