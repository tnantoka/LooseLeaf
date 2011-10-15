module.exports = function(models) {
  
  this.index = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
        res.render('index', {
          posts: posts
        });
        session.close();
      });
    });
  }
  
  return this;

}.bind({});

