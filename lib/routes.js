/* Mapping uri to method of contorller */

module.exports = function(app, controllers, models) {

  app.get('/', controllers.Index.index);

  app.post('/auth/login', controllers.Auth.login);

//  app.get('/admin', controllers.admin.Index.index);
};

