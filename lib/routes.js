/* Mapping uri to method of contorller */
var filters = require('./filters');

module.exports = function(app, controllers, models) {

  app.get('/', filters.private, controllers.Index.index);

  app.get('/search/:keyword', filters.private, controllers.Index.search);
  app.get('/tag/:tag', filters.private, controllers.Index.tag);
  app.get('/author/:username', filters.private, controllers.Index.author);

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

