/* Mapping uri to method of contorllers */
var filters = require('./filters');

module.exports = function(app, controllers, models) {

  app.get('/', controllers.Index.index);
  app.get('/next/:offset', controllers.Index.next);

  app.get('/search/:keyword', controllers.Index.search);
  app.get('/tags/:tag', controllers.Index.tag);
  app.get('/users/:username/posts.:format?', controllers.Index.user);

  app.param('userId', controllers.Users.loadUser);
  app.param('userIdWithPassword', controllers.Users.loadUserWithPassword);
  app.get('/users', controllers.Users.index);
  app.get('/users/:userId', controllers.Users.show);
  app.post('/users', filters.login, controllers.Users.create);
  app.put('/users/:userIdWithPassword', filters.login, controllers.Users.edit);

  app.param('postId', controllers.Posts.loadPost);
  app.get('/posts/:postId.:format?', controllers.Posts.show);
  app.post('/posts', filters.login, controllers.Posts.create);
  app.put('/posts/:postId', filters.login, controllers.Posts.edit);
  app.del('/posts/:postId', filters.login, controllers.Posts.destroy);

  app.get('/posts/:postId/comments', controllers.Comments.index);
  app.post('/posts/:postId/comments', controllers.Comments.create);
  app.del('/posts/:postId/comments/:commentId', filters.login, controllers.Comments.destroy);

  app.get('/files', filters.login, controllers.Files.index);
  app.post('/files', filters.login, controllers.Files.create);
  app.del('/files/:filename', filters.login, controllers.Files.destroy);

  app.post('/auth/login', controllers.Auth.login);
  app.get('/auth/logout', filters.login, controllers.Auth.logout);

};

