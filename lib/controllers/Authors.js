//var persistence = require('../ext/persistencejs/lib/persistence').persistence;

module.exports = function(models) {

  this.index = function(req, res, next) {
    var session = models.getSession();
    session.transaction(function(tx) {
      models.User.all(session).list(tx, function(users) {
        res.render('authors/index', {
          title: 'Authors',
          users: users
        });
        session.close();
      });
    });
  }
  
  return this;

}.bind({});

