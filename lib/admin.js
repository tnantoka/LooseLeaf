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
    };
    blog.entry.add(entry, function(err, entry) {
      if (err) {
        next(err);
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
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.list);
    }
    else {
      res.render(View.admin.entry.list, {
        locals: initLocals({
          pageTitle: 'Entry List',
          entries: Entries
        }), 
        layout: View.admin.layout
      });
    } 
  });
  
  // Edit entry
  app.get(Mapping.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
    }
    else if (Entries.getIndex(id) == -1) {
      res.redirect(Mapping.admin.entry.list);    
    }
    else {
      fs.readFile(Path.entry + id + '.json', 'UTF-8', function(err, data) {
        if (err) {
          res.redirect('back');
        }
        var entry =  JSON.parse(data);
        res.render(View.admin.entry.form, {
          locals: initLocals({
            pageTitle: 'Edit Entry',
            msg: '',
            action: Mapping.admin.entry.edit.replace(':id', id),
            entry: entry
          }), 
          layout: View.admin.layout
        });
      });
    }
  });
  app.post(Mapping.admin.entry.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
    }
    else if (Entries.getIndex(id) == -1) {
      res.redirect(Mapping.admin.entry.list);    
    }
    else {
      var title = req.body.title;
      var category = req.body.category;
      var tags = [];
      var body = req.body.body;
      if (!title || category === null || !body) {
        res.redirect('back');
      }
      else {
        fs.readFile(Path.entry + id + '.json', 'UTF-8', function(err, data) {
          if (err) {
            res.redirect('back');
          }
          else {
            var entry =  JSON.parse(data);
            var date = new Date().toString();
            var uuidString = uuid.generate();
            // Delete by older category
            Categories[entry.category].entries.splice
              (Categories[entry.category].entries.indexOf(id), 1);
            
            var index = Entries.getIndex(id);
            Entries[index].title = entry.title = title;
            Entries[index].category = entry.category = category;
            Entries[index].tags = entry.tags = tags;
            Entries[index].body = entry.body = body;
  // Date is never update
  //          Entries[index].date = entry.date = date;
            entry.update = date;
            Entries[index].update = common.toReadableDate(entry.update);
            Entries[index].opening = common.makeOpening(body);
            Entries[index].uuid = entry.uuid = uuidString;
  
  // Not change the sorting order of Entries
  //          Entries.unshift(Entries[index]);
  //          Entries.splice(index + 1, 1);
    
            Categories[category].entries.unshift(id);
  
            fs.writeFile(Path.entry + id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
              if (err) {
                res.redirect('back');
              }
              else {
                res.render(View.admin.entry.result, {
                  locals: initLocals({
                    pageTitle: 'Edit Entry',
                    entry: entry, 
                    msg: '以下の内容に修正しました。'
                  }), 
                  layout: View.admin.layout
                });

                // Atom
                generateAtom();
            
              }
            });
          }
        });
      }
    }
  });
  
  // Delete entry
  app.get(Mapping.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.remove.replace(':id', id));
    }
    else if (Entries.getIndex(id) == -1) {
      res.redirect(Mapping.admin.entry.list);    
    }
    else {
      var index = Entries.getIndex(id);
      res.render(View.admin.entry.confirm, {
        locals: initLocals({
          pageTitle: 'Delete Entry',
          entry: Entries[index]
        }), 
        layout: View.admin.layout
      });  
    }  
  });
  app.post(Mapping.admin.entry.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.entry.remove.replace(':id', id));
    }
    else if (Entries.getIndex(id) == -1) {
      res.redirect(Mapping.admin.entry.list);    
    }
    else {
      var index = Entries.getIndex(id);
      
      // Delete by categories
      Categories[Entries[index].category].entries.splice
        (Categories[Entries[index].category].entries.indexOf(id), 1);
  
      var entry = Entries[index];
      Entries.splice(index, 1);
      fs.unlink(Path.entry + id + '.json', function(err) {
        if (err) {
          res.redirect('back');
        }
        else {
          res.render(View.admin.entry.remove, {
            locals: initLocals({
              pageTitle: 'Delete Entry', 
              entry: entry
            }), 
            layout: View.admin.layout
          });

          // Atom
          generateAtom();

        }
      });
    } 
  });
  
  // List categories
  app.get(Mapping.admin.category.list, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    else {
      res.render(View.admin.category.list, {
        locals: initLocals({
          pageTitle: 'Category List',
          msg: ''
        }), 
        layout: View.admin.layout
      });
    } 
  });
  
  // Add new category
  app.post(Mapping.admin.category.add, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    else {
      var name = req.body.name;
      if (!name) {
        res.redirect('back');
      } else {
        var ids = [];
        for (var i in Categories) {
          if (Categories.hasOwnProperty(i)) {
            ids.push(i);
          }
        }
        var id = Math.max.apply(null, ids) + 1;
        Categories[id] = {
          name: name,
          entries: []
        };
        fs.writeFile(Path.category, JSON.stringify(Categories, null, '\t'), 'UTF-8', function(err) {
          if (err) {
            res.redirect('back');
          }
          else {
            res.redirect(Mapping.admin.category.list);      
          }
        });
      }
    }
  });
  
  // Edit category name
  app.post(Mapping.admin.category.edit, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    else if (!Categories[id]) {
      res.redirect(Mapping.admin.category.list);    
    }
    else {
      var name = req.body['name_' + id];
      Categories[id].name = name;
      fs.writeFile(Path.category, JSON.stringify(Categories, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          res.redirect('back');
        }
        else {
          res.redirect(Mapping.admin.category.list);      
        }
      });
    } 
  });
  
  // Delete entry
  app.get(Mapping.admin.category.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    else if (!Categories[id]) {
      res.redirect(Mapping.admin.category.list);    
    }
    else {
      // May not delete category id 0
      if (id === 0) {
        res.redirect('back');
      }
      res.render(View.admin.category.confirm, {
        locals: initLocals({
          pageTitle: 'Delete Category',
          id: id
        }), 
        layout: View.admin.layout
      });
    }
  });
  app.post(Mapping.admin.category.remove, function(req, res, next) {
    var id = req.params.id;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
    }
    else if (!Categories[id]) {
      res.redirect(Mapping.admin.category.list);    
    }
    else {
      var entries = Categories[id].entries;
      var i;
      for (i = 0; i < entries.length; i++) {
        var entryId = entries[i];
        var entry = JSON.parse(fs.readFileSync(Path.entry + entryId + '.json', 'UTF-8'));
        entry.category = 0;
        fs.writeFileSync(Path.entry + entryId + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8');
      }
      for (i = 0; i < Entries.length; i++) {
        if (Entries[i].category == id) {
          Entries[i].category = 0;
        }
      }
      // TODO: Sort
      Categories[0].entries = Categories[id].entries.concat(Categories[0].entries);
      delete Categories[id];
    
      fs.writeFile(Path.category, JSON.stringify(Categories, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          res.redirect('back');
        }
        else {
          res.redirect(Mapping.admin.category.list);      
        }
      });
    }
  });
  
  // List files
  app.get(Mapping.admin.file.list, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    else {
      var files = [];
      var tempFiles = fs.readdirSync(Path.file);
      for (var i = 0; i < tempFiles.length; i++) {
        if (/^\.+/.test(tempFiles[i])) {
          continue;
        }
        else {
          var stat = fs.statSync(Path.file + tempFiles[i]);
          files.push({
            name: tempFiles[i],
            date: stat.mtime,
            size: stat.size
          });
        }
      }
      res.render(View.admin.file.list, {
        locals: initLocals({
          pageTitle: 'File List', 
          msg: '',
          files: files
        }), 
        layout: View.admin.layout
      });
    } 
  });
  
  // Add new file
  app.post(Mapping.admin.file.add, function(req, res, next) {
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    else {
      req.form.complete(function(err, fields, files) {
        if (err) {
          throw err;
        }
        else {
          fs.rename(files.file.path, Path.file + files.file.filename, function(err) {
            if (err) {
              res.redirect('back');        
            }
            else {
              res.redirect(Mapping.admin.file.list);        
            }
          });
        }
      });
    } 
  });
  
  // Delete file
  app.post(Mapping.admin.file.confirm, function(req, res, next) {
    var name = req.body.name;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    else {
      res.render(View.admin.file.confirm, {
        locals: initLocals({
          pageTitle: 'Delete File', 
          name: name
        }), 
        layout: View.admin.layout
      });
    }
  });
  app.post(Mapping.admin.file.remove, function(req, res, next) {
    var name = req.body.name;
    if (!isLogged(req)) {
      res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
    }
    else {
      fs.unlink(Path.file + name, function(err) {
        if (err) {
          res.redirect('back');
        }
        else {
          res.redirect(Mapping.admin.file.list);
        }
      });
    }
  });
  
};
