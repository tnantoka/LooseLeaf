module.exports = function(models) {

  this.login = function(req, res, next) {
    models.User.findByUsernameAndPassword(req.body.user.username, req.body.user.password, function(err, user) {
      console.log(req.body.user);
      console.log(user);
      if (err) next(err);
      req.session.user = user;
// TODO notify
//        req.flash();
      //res.redirect('home');
      res.redirect(req.header('Referer'));
    });
  };
  
  this.logout = function(req, res, next) {
    req.session.destroy(function() {
//      res.redirect('home');
      res.redirect(req.header('Referer'));
    });
  };

  return this;

}.bind({});

