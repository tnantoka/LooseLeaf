var persistence = require('../ext/persistencejs/lib/persistence').persistence;

module.exports = function(models) {
  
  this.index = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).and(req.privateFilter).prefetch('user').order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
        res.render('index', {
          title: '',
          posts: posts
        });
        session.close();
      });
    });
  }

  this.search = function(req, res, next) {
    var keyword = decodeURIComponent(req.params.keyword);
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).and(new persistence.OrFilter(new persistence.PropertyFilter('title', 'LIKE', '%' + keyword + '%'), new persistence.PropertyFilter('body', 'LIKE', '%' + keyword + '%'))).prefetch('user').order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
        res.render('index', {
          title: keyword,
          posts: posts
        });
        session.close();
      });
    });
  };
  
  this.tag = function(req, res, next) {
    var tag = decodeURIComponent(req.params.tag);
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).filter('tag', 'LIKE', '%' + tag + '%').prefetch('user').order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
        res.render('index', {
          title: tag,
          posts: posts
        });
        session.close();
      });
    });
  };
  
  this.user = function(req, res, next) {
    var username = decodeURIComponent(req.params.username);
    var session = models.getSession();
    session.transaction(function(tx) {
      models.User.findBy(session, tx, 'username', username, function(user) {
        if (!user) { 
          session.close();
          return next();
        }
        models.Post.all(session).filter('user', '=', user.id).prefetch('user').order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
          res.render('user', {
            title: username,
            posts: posts
          });
          session.close();
        });
      });
    });
  };

  return this;

}.bind({});

