/* Mapping uri to method of contorllers */
var filters = require('./filters');

module.exports = function(app, controllers, models, config ) {

  var base_get = ""; //config.process.loc;
  var base_post= config.process.loc;
  var base_del = config.process.loc;
  var base_put = config.process.loc;

  app.get ( '^' + config.process.loc + '*', function ( req, res, next )  {
    req.url = req.url.replace ( config.process.loc, "" );
    next ( );
  });

  app.get   ( base_get  + '/', controllers.Index.index);
  app.get   ( base_get  + '/next/:offset', controllers.Index.next);

  app.get   ( base_get  + '/search/:keyword', controllers.Index.search);
  app.get   ( base_get  + '/tags/:tag', controllers.Index.tag);
  app.get   ( base_get  + '/users/:username/posts.:format?', controllers.Index.user);

  app.param ('userId', controllers.Users.loadUser);
  app.param ('userIdWithPassword', controllers.Users.loadUserWithPassword);
  app.get   ( base_get  + '/users', controllers.Users.index);
  app.get   ( base_get  + '/users/:userId', controllers.Users.show);
  app.post  ( base_post + '/users', filters.login, controllers.Users.create);
  app.put   ( base_put  + '/users/:userIdWithPassword', filters.login, controllers.Users.edit);

  app.param ( 'postId', controllers.Posts.loadPost);
  app.get   ( base_get  + '/posts/:postId.:format?', controllers.Posts.show);
  app.post  ( base_post + '/posts', filters.login, controllers.Posts.create);
  app.put   ( base_put  + '/posts/:postId', filters.login, controllers.Posts.edit);
  app.del   ( base_del  + '/posts/:postId', filters.login, controllers.Posts.destroy);

  app.get   ( base_get  + '/posts/:postId/comments', controllers.Comments.index);
  app.post  ( base_post + '/posts/:postId/comments', controllers.Comments.create);
  app.del   ( base_del  + '/posts/:postId/comments/:commentId', filters.login, controllers.Comments.destroy);

  app.get   ( base_get  + '/files', filters.login, controllers.Files.index);
  app.post  ( base_post + '/files', filters.login, controllers.Files.create);
  app.del   ( base_del  + '/files/:filename', filters.login, controllers.Files.destroy);

  app.post  ( base_post + '/auth/login', controllers.Auth.login);
  app.get   ( base_get  + '/auth/logout', filters.login, controllers.Auth.logout);

};

