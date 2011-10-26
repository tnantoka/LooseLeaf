var path = require('path');
var models = require('./models')(path.resolve('.'), true, function() {

var session = models.getSession();

var user = new models.User();
user.username = 'admin';
user.password = 'pass';
user.fullname = 'Administrator';
user.is_admin = true;
user.intro = 'I\'m administrator';
user.icon = '/images/users/tnantoka.png';
user.created_at = new Date();
session.add(user);

session.transaction(function(tx) {
  session.flush(tx, function() {
    session.close();
  });
});

});

