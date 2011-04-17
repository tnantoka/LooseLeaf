/* Route for admin */

var fs = require('fs'),
  join = require('path').join,
  common = require('./common')
  mapping = require('./mapping').get();

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
        msg: 'Login failed. Please retry.', 
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
      msg: '',
      action: mapping.uri.admin.entry.add,
      entry: {
        title: '',
        category: 0,
        body: ''
      },
      layout: mapping.view.admin.layout
    });
  });
  app.post(mapping.uri.admin.entry.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.entry.add);
    }
    var entry = {
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      tb: req.body.tb,
      tags: []
    };
    blog.entry.add(entry, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.result, {
        pageTitle: 'Add New Entry',
        entry: entry,
        msg: '以下の内容で投稿しました。',
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
      entries: blog.entries(),
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
        msg: '',
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
    var edit = {
      title: req.body.title,
      category: req.body.category,
      body: req.body.body,
      tb: req.body.tb,
      tags: []
    };
    blog.entry.edit(id, edit, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.result, {
        pageTitle: 'Edit Entry',
        entry: entry, 
        msg: '以下の内容に修正しました。',
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
    blog.entry.remove(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.admin.entry.remove, {
        pageTitle: 'Delete Entry', 
        entry: entry,
        layout: mapping.view.admin.layout
      });
    });
  });
  
  // List categories
  app.get(mapping.uri.admin.category.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
    }
    res.render(mapping.view.admin.category.list, {
      pageTitle: 'Category List',
      msg: '',
      layout: mapping.view.admin.layout
    });
  });
  
  // Add new category
  app.post(mapping.uri.admin.category.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(mapping.uri.admin.ref + mapping.uri.admin.category.list);
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
        msg: '',
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
    blog.file.add(req.form.complete, function(err) {
      res.redirect(mapping.uri.admin.file.list);        
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
    blog.file.remove(req.body.name, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(mapping.uri.admin.file.list);
    });
  });
  
};
