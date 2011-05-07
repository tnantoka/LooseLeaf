/* Route for admin */

var fs = require('fs'),
  join = require('path').join,
  util = require('./util')
  mapping = require('./mapping').get(),
  check = require('validator').check;

exports.set = function(app, blog, conf) {

  /* Private fucntions */

  // Login check
  function isLogged(req) {
    return req.session && req.session.userId == conf.admin.id;
  }

  // Login
  app.get(mapping.uri.admin.root, function(req, res, next) {
    res.redirect(mapping.uri.admin.login);
  });
  app.get(mapping.uri.admin.login, function(req, res, next) {
    if (isLogged(req)) {
      return res.redirect(mapping.uri.admin.index);
    }
    res.render(mapping.view.admin.login, {
      pageTitle: 'Login',
      msg: '',
      ref: req.query.ref ? req.query.ref : null,
      layout: mapping.view.admin.layout
    });
  });
  app.post(mapping.uri.admin.login, function(req, res, next) {
    var userId = req.body.userId;
    var password = req.body.password;
    try {
      check(userId).isAlphanumeric();
      check(password).isAlphanumeric();   
    } catch (e) {
      return next(new util.BadRequest(e));
    }
    if (userId == conf.admin.id && password == conf.admin.pass) {
      req.session.regenerate(function() {
        req.session.userId = userId;
        // Return to refferer page
        if (req.body.ref) {
          res.redirect(req.body.ref);
        }
        else {
          res.redirect(mapping.uri.admin.index);
        }
      });
    } else {
      res.render(mapping.view.admin.login, {
        pageTitle: 'Login',
        msg: 'Authentication failed. Please login again.', 
        ref: req.body.ref ? req.body.ref : null,
        layout: mapping.view.admin.layout
      });
    }
  });
  
  // Dashboard
  app.get(mapping.uri.admin.index, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.login);
    }
    res.render(mapping.view.admin.index, {
      pageTitle: 'Dashboard',
      layout: mapping.view.admin.layout
    });
  });
  
  // Logout
  app.get(mapping.uri.admin.logout, function(req, res, next) {
    req.session.destroy(function() {
      res.redirect(mapping.uri.admin.login);
    });
  });
  
  // Post new entry
  app.get(mapping.uri.admin.entry.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.add);
    }
    res.render(mapping.view.admin.entry.form, {
      pageTitle: 'Post New Entry',
      action: mapping.uri.admin.entry.add,
      entry: {
        title: '',
        category: 0,
        body: '',
        tags: ''
      },
      layout: mapping.view.admin.layout
    });
  });
  app.post(mapping.uri.admin.entry.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.add);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    try {
      check(req.body.title).notEmpty();
      check(req.body.category).isNumeric();   
      check(req.body.body).notEmpty();
    } catch (e) {
      return next(new util.BadRequest(e));
    }
    var entry = {
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      tb: req.body.tb,
      private: req.body.private,
      tags: req.body.tags
    };
    blog.entry.add(entry, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.result, {
        pageTitle: 'Add New Entry',
        entry: entry,
        layout: mapping.view.admin.layout
      });
    });
  });
  
  // List entry
  // TODO: Pagenation
  app.get(mapping.uri.admin.entry.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.list);
    }
    res.render(mapping.view.admin.entry.list, {
      pageTitle: 'Entry List',
      entries: blog.entry.getAll(),
      layout: mapping.view.admin.layout
    }); 
  });
  
  // Edit entry
  app.get(mapping.uri.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.edit.replace(':id', id));
    }
    blog.entry.get(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.form, {
        pageTitle: 'Edit Entry',
        action: mapping.uri.admin.entry.edit.replace(':id', entry.id),
        entry: entry,
        layout: mapping.view.admin.layout
      });
    });
  });
  app.post(mapping.uri.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.edit.replace(':id', id));
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    try {
      check(req.body.title).notEmpty();
      check(req.body.category).isNumeric();   
      check(req.body.body).notEmpty();
    } catch (e) {
      return next(new util.BadRequest(e));
    }
    var edit = {
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      tb: req.body.tb,
      private: req.body.private,
      tags: req.body.tags
    };
    blog.entry.edit(id, edit, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.result, {
        pageTitle: 'Edit Entry',
        entry: entry, 
        layout: mapping.view.admin.layout
      });
    });
  });
  
  // Delete entry
  app.get(mapping.uri.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.remove.replace(':id', id));
    }
    blog.entry.get(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.confirm, {
        pageTitle: 'Delete Entry',
        entry: entry,
        layout: mapping.view.admin.layout
      });
    });
  });
  app.post(mapping.uri.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.remove.replace(':id', id));
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    blog.entry.remove(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.entry.list);
    });
  });
  
  // List categories
  app.get(mapping.uri.admin.category.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    res.render(mapping.view.admin.category.list, {
      pageTitle: 'Category List',
      layout: mapping.view.admin.layout
    });
  });
  
  // Add new category
  app.post(mapping.uri.admin.category.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    blog.category.add(req.body.name, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.category.list);      
    });
  });
  
  // Edit category name
  app.post(mapping.uri.admin.category.edit, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    var id = req.params.id;
    var name = req.body['name_' + id];
    blog.category.edit({ id: id, name: name }, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.category.list);      
    });
  });
  
  // Delete entry
  app.get(mapping.uri.admin.category.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    res.render(mapping.view.admin.category.confirm, {
      pageTitle: 'Delete Category',
      id: id,
      layout: mapping.view.admin.layout
    });
  });
  app.post(mapping.uri.admin.category.remove, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    blog.category.remove(req.params.id, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.category.list);      
    });
  });
  
  // List files
  app.get(mapping.uri.admin.file.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.file.list);
    }
    blog.file.list(function(err, list) {
      res.render(mapping.view.admin.file.list, {
        pageTitle: 'File List', 
        files: list.files,
        layout: mapping.view.admin.layout
      });
    });
  });
  
  // Add new file
  app.post(mapping.uri.admin.file.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.file.list);
    }
    req.form.complete(function(err, fields, files) {
      if (!util.checkToken({
        session: {
          id: req.session.id
        },
        body: {
          token: fields.token
        }
        })) {
        return next(new util.BadRequest('Invalid token:' + fields.token));
      }
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      blog.file.add(files.file.path, files.file.filename, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect(mapping.uri.admin.file.list);        
      });
    });
  });
  
  // Delete file
  app.post(mapping.uri.admin.file.confirm, function(req, res, next) {
    var name = req.body.name;
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.file.list);
    }
    res.render(mapping.view.admin.file.confirm, {
      pageTitle: 'Delete File', 
      name: name,
      layout: mapping.view.admin.layout
    });
  });
  app.post(mapping.uri.admin.file.remove, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.file.list);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    blog.file.remove(req.body.name, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.file.list);
    });
  });

  // List themes
  app.get(mapping.uri.admin.theme.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.theme.list);
    }
    res.render(mapping.view.admin.theme.list, {
      pageTitle: 'Change Theme', 
      layout: mapping.view.admin.layout
    });
  });
  // Change themes
  app.post(mapping.uri.admin.theme.edit, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.theme.list);
    }
    if (!util.checkToken(req)) {
      return next(new util.BadRequest('Invalid token:' + req.body.token));
    }
    blog.theme.edit(req.body.theme, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('back');
    });
  });
  
};
