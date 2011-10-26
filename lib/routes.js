/* Mapping uri to method of contorller */
var filters = require('./filters');

module.exports = function(app, controllers, models) {

  app.get('/', filters.private, controllers.Index.index);

  app.get('/search/:keyword', filters.private, controllers.Index.search);
  app.get('/tag/:tag', filters.private, controllers.Index.tag);
  app.get('/user/:username', filters.private, controllers.Index.user);

  app.param('userId', controllers.Users.loadUser);
  app.get('/users', filters.private, controllers.Users.index);
  app.get('/users/:userId', filters.private, controllers.Users.show);
  app.post('/users', filters.login, controllers.Users.create);
  app.put('/users/:userId', filters.login, controllers.Users.edit);

  app.param('postId', controllers.Posts.loadPost);
  app.get('/posts/:postId', filters.private, controllers.Posts.show);
  app.post('/posts', filters.login, controllers.Posts.create);
  app.put('/posts/:postId', filters.login, controllers.Posts.edit);
  app.del('/posts/:postId', filters.login, controllers.Posts.destroy);

  app.post('/auth/login', controllers.Auth.login);
  app.get('/auth/logout', filters.login, controllers.Auth.logout);

  app.get('/authors', controllers.Authors.index);

//  app.get('/admin', controllers.admin.Index.index);
};

