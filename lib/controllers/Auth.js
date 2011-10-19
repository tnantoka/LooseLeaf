module.exports = function(models) {

  this.login = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.User.all(session).filter('username', '=', req.body.user.username).filter('password', '=', req.body.user.password).one(tx, function(user) {
        console.log(user);
        if (user) {
          req.session.user = user;
        } else {
// TODO notify
//          req.flash();
        }
        res.redirect('home');
        session.close();
      });
    });
  };
  
  return this;

}.bind({});

