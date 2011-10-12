/* Mapping uri to method of contorller */

module.exports = function(app, controllers, models) {

  //app.get('/', controllers.index.index);
  app.get('/', controllers.posts.index);

  app.get('/admin', controllers.admin.index.index);
};

