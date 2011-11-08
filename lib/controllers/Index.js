module.exports = function(models) {
  
  this.index = function(req, res, next) {
    var flag = req.session.user ? null : false;
    models.Post.findByIsPrivate(flag, 5, 0, function(err, posts) {
      if (err) next(err);
      res.render('index', {
        title: '',
        posts: posts
      });
    });
  }

  this.next = function(req, res, next) {
    var offset = parseInt(req.params.offset);
    var flag = req.session.user ? null : false;
    models.Post.findByIsPrivate(flag, 1, offset, function(err, posts) {
      if (err) next(err);
      res.send(JSON.stringify(posts[0] || false));
    });
  }

  this.search = function(req, res, next) {
    var keyword = req.params.keyword;
    var flag = req.session.user ? null : false;
    models.Post.searchByIsPrivate(keyword, flag, null, null, function(err, posts) {
      if (err) return next(err);
      res.render('index', {
        title: keyword,
        posts: posts
      });
    });
  };
  
  this.tag = function(req, res, next) {
    var tag = req.params.tag;
    var flag = req.session.user ? null : false;
    models.Post.searchByTagAndIsPrivate(tag, flag, null, null, function(err, posts) {
      if (err) return next(err);
      res.render('index', {
        title: tag,
        posts: posts
      });
    });
  };
  
  this.user = function(req, res, next) {
    var username = req.params.username;
    var flag = req.session.user ? null : false;
    models.User.findByUsername(username, function(err, user) {
      if (err) return next(err);
      models.Post.findByUserIdAndIsPrivate(user.id, flag, null, null, function(err, posts) {
        if (err) return next(err);

        if (req.params.format == 'json') {
          //res.contentType('application/json');
          res.send(JSON.stringify(posts));
        } else {
          res.render('index', {
            title: username + '\'s posts',
            posts: posts
          });
        }

      });
    });
  };

  return this;

}.bind({});

