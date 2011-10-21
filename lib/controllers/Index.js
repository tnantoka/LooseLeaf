module.exports = function(models) {
  
  this.index = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.Post.all(session).prefetch('user').order('created_at', models.DESC).limit(5).skip(0).list(tx, function(posts) {
        posts[0].user.selectJSON(tx, ['*'], function(user) {
        console.log('user---------', user);
        posts[0]['user2'] = user;
        res.render('index', {
          title: '',
          posts: posts
        });
        session.close();
        });
      });
    });
  }
  
  return this;

}.bind({});

