/* Route for admin */

var fs = require('fs'),
  join = require('path').join,
  common = require('./common'),
  atom = require('./atom'),
  uuid = require('./atom/uuid');

var NUM = 5;

var Mapping = {
  entry: '/entry/:id/', 
  admin: {
    root: '/admin?', 
    login: '/admin/login/',
    logout: '/admin/logout/',
    index: '/admin/index/',
    ref: '/admin/login/?ref=' ,
    entry: {
      add: '/admin/entry/add/', 
      edit: '/admin/entry/edit/:id/', 
      list: '/admin/entry/list/', 
      remove: '/admin/entry/remove/:id/'
    }, 
    category: {
      add: '/admin/category/add/',
      list: '/admin/category/list/',
      edit: '/admin/category/edit/:id/',
      remove: '/admin/category/remove/:id/'
    },
    file: {
      add: '/admin/file/add/',
      list: '/admin/file/list/',
      confirm: '/admin/file/confirm/',
      remove: '/admin/file/remove/'
    }
  }
};

var View = {
  admin: {
    login: 'admin/login',
    index: 'admin/index',
    layout: 'admin/layout.ejs', 
    entry: {
      form: 'admin/entryForm', 
      result: 'admin/entryResult', 
      list: 'admin/entryList', 
      confirm: 'admin/entryConfirm', 
      remove: 'admin/entryRemove' 
    },
    category: {
      list: 'admin/categoryList', 
      confirm: 'admin/categoryConfirm'
    },
    file: {
      list: 'admin/fileList', 
      confirm: 'admin/fileConfirm'
    }
  }
};


exports.set = function(app, siteDir, Path, Conf, Categories, Tags, Entries, blog) {

  /* Private fucntions */

  // Login check
  function isLogged(req) {
    return req.session && req.session.userId == Conf.admin.id;
  }

  // Login
  app.get(Mapping.admin.root, function(req, res, next) {
    res.redirect(Mapping.admin.login);
  });
  app.get(Mapping.admin.login, function(req, res, next) {
    if (isLogged(req)) {
      return res.redirect(Mapping.admin.index);
    }
    res.render(View.admin.login, {
      pageTitle: 'Login',
      msg: '',
      ref: req.query.ref ? req.query.ref : null,
      layout: View.admin.layout
    });
  });
  app.post(Mapping.admin.login, function(req, res, next) {
    var userId = req.body.userId;
    var password = req.body.password;
    if (userId == Conf.admin.id && password == Conf.admin.pass) {
      req.session.regenerate(function() {
        req.session.userId = userId;
        // Return to refferer page
        if (req.body.ref) {
          res.redirect(req.body.ref);
        }
        else {
          res.redirect(Mapping.admin.index);
        }
      });
    } else {
      res.render(View.admin.login, {
        pageTitle: 'Login',
        msg: 'Login failed. Please retry.', 
        ref: req.body.ref ? req.body.ref : null,
        layout: View.admin.layout
      });
    }
  });
  
  // Dashboard
  app.get(Mapping.admin.index, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.login);
    }
    res.render(View.admin.index, {
      pageTitle: 'Dashboard',
      layout: View.admin.layout
    });
  });
  
  // Logout
  app.get(Mapping.admin.logout, function(req, res, next) {
    req.session.destroy(function() {
      res.redirect(Mapping.admin.login);
    });
  });
  
  // Post new entry
  app.get(Mapping.admin.entry.add, function(req, res, next) {
    if (!isLogged(req)) {
     return res.redirect(Mapping.admin.ref + Mapping.admin.entry.add);
    }
    res.render(View.admin.entry.form, {
      pageTitle: 'Post New Entry',
      msg: '',
      action: Mapping.admin.entry.add,
      entry: {
        title: '',
        category: 0,
        body: ''
      },
      layout: View.admin.layout
    });
  });
  app.post(Mapping.admin.entry.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.entry.add);
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
      res.render(View.admin.entry.result, {
        pageTitle: 'Add New Entry',
        entry: entry,
        msg: '以下の内容で投稿しました。',
        layout: View.admin.layout
      });
    });
  });
  
  // List entry
  // TODO: Pagenation
  app.get(Mapping.admin.entry.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.entry.list);
    }
    res.render(View.admin.entry.list, {
      pageTitle: 'Entry List',
      entries: blog.entries(),
      layout: View.admin.layout
    }); 
  });
  
  // Edit entry
  app.get(Mapping.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
    }
    blog.entry.get(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(View.admin.entry.form, {
        pageTitle: 'Edit Entry',
        msg: '',
        action: Mapping.admin.entry.edit.replace(':id', entry.id),
        entry: entry,
        layout: View.admin.layout
      });
    });
  });
  app.post(Mapping.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
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
      res.render(View.admin.entry.result, {
        pageTitle: 'Edit Entry',
        entry: entry, 
        msg: '以下の内容に修正しました。',
        layout: View.admin.layout
      });
    });
  });
  
  // Delete entry
  app.get(Mapping.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.entry.remove.replace(':id', id));
    }
    blog.entry.get(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(View.admin.entry.confirm, {
        pageTitle: 'Delete Entry',
        entry: entry,
        layout: View.admin.layout
      });
    });
  });
  app.post(Mapping.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.remove.replace(':id', id));
    }
    blog.entry.remove(id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(View.admin.entry.remove, {
        pageTitle: 'Delete Entry', 
        entry: entry,
        layout: View.admin.layout
      });
    });
  });
  
  // List categories
  app.get(Mapping.admin.category.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    res.render(View.admin.category.list, {
      pageTitle: 'Category List',
      msg: '',
      layout: View.admin.layout
    });
  });
  
  // Add new category
  app.post(Mapping.admin.category.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    blog.category.add(req.body.name, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(Mapping.admin.category.list);      
    });
  });
  
  // Edit category name
  app.post(Mapping.admin.category.edit, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    var id = req.params.id;
    var name = req.body['name_' + id];
    blog.category.edit({ id: id, name: name }, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(Mapping.admin.category.list);      
    });
  });
  
  // Delete entry
  app.get(Mapping.admin.category.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    res.render(View.admin.category.confirm, {
      pageTitle: 'Delete Category',
      id: id,
      layout: View.admin.layout
    });
  });
  app.post(Mapping.admin.category.remove, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    blog.category.remove(req.params.id, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(Mapping.admin.category.list);      
    });
  });
  
  // List files
  app.get(Mapping.admin.file.list, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    blog.file.list(function(err, list) {
      res.render(View.admin.file.list, {
        pageTitle: 'File List', 
        msg: '',
        files: list.files,
        layout: View.admin.layout
      });
    });
  });
  
  // Add new file
  app.post(Mapping.admin.file.add, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    req.form.complete(function(err, fields, files) {
      if (err) {
        return next(new common.InternalServerError(err.message));
      }
      fs.rename(files.file.path, Path.file + files.file.filename, function(err) {
        if (err) {
          return next(new common.InternalServerError(err.message));
        }
        res.redirect(Mapping.admin.file.list);        
      });
    });
  });
  
  // Delete file
  app.post(Mapping.admin.file.confirm, function(req, res, next) {
    var name = req.body.name;
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    res.render(View.admin.file.confirm, {
      pageTitle: 'Delete File', 
      name: name,
      layout: View.admin.layout
    });
  });
  app.post(Mapping.admin.file.remove, function(req, res, next) {
    if (!isLogged(req)) {
      return res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    blog.file.remove(req.body.name, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect(Mapping.admin.file.list);
    });
  });
  
};
