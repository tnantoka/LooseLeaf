/* Route for public */

var fs = require('fs'),
  join = require('path').join,
  common = require('./common');

var VERSION = require('./package').version();
var NUM = 5;

var Mapping = {
  // TODO: Redirect if no slash
  root: '/', 
  top: '/index/0/', 
  index: '/index/:offset/', 
  entry: '/entry/:id/', 
  comment: '/entry/:id/comment/', 
  category: '/category/:id/', 
  trackback: '/trackback/:id/'
};

var View = {
  index: 'index', 
  entry: 'entry', 
  category: 'category', 
};

exports.set = function(app, siteDir, blog) {

  // File paths
  var Path = {
    conf: join(siteDir, 'conf.json'),
    category: join(siteDir, '/data/meta/category.json'),
    tag: join(siteDir, '/data/meta/tag.json'),
    entry: join(siteDir, '/data/entry/'),
    file: join(siteDir, '/public/file/')
  };

  // Load conf files
  var Conf = JSON.parse(fs.readFileSync(Path.conf, 'UTF-8'));
  var Categories = JSON.parse(fs.readFileSync(Path.category, 'UTF-8')); 
  var Tags = JSON.parse(fs.readFileSync(Path.tag, 'UTF-8'));

  // Init Entries
  var Entries = (function() {
    var entries = [];
    var i = 0;

    var files = fs.readdirSync(Path.entry);
    var jsonFiles = [];

    // Select only .json files
    for (i = 0; i < files.length; i++) {
      if (/\.json$/.test(files[i])) {
        jsonFiles.push(files[i]);
      }
    }

    // Init entries meta info
    for (i = 0; i < jsonFiles.length; i++) {
      var entry = JSON.parse(fs.readFileSync(Path.entry + jsonFiles[i]));
      entries.push({
        id: entry.id,
        title: entry.title,
        // TODO: toReadable when store file
        date: common.toReadableDate(entry.date),
        update: common.toReadableDate(entry.update),
        category: entry.category,
        tags: entry.tags,
        comments: entry.comments.length,
        trackbacks: entry.trackbacks.length,
        opening: common.makeOpening(entry.body),
        uuid: entry.uuid
      });
    }

    // Descending sort by date
    entries.sort(function(a, b) {
      var aDate = new Date(a.date);
      var bDate = new Date(b.date);
      return bDate - aDate;
    });
  
    // Get entries
    var get = function() {
      return entries;
    };
  
    // Get entry's index
    var getIndex = function(id) {
      for (var i = 0; i < entries.length; i++) {
        if (id == entries[i].id) {
          return i;
        }
      }
      return -1;
    };
  
    entries.getIndex = getIndex;
  
    return entries;
  })();

  // Init categories
  for (var i in Categories) {
    if (Categories.hasOwnProperty(i)) {
      Categories[i].entries = [];  
    }
  }
  for (var i = 0; i < Entries.length; i++) {
    Categories[Entries[i].category].entries.push(Entries[i].id);
  }

  /* Private fucntions */

  // Root(show offset 0)
  app.get(Mapping.root, function(req, res, next) {
    blog.entry.list(0, function(err, list) {
      if (err) {
        return next(new common.InternalServerError(err.message));
      }
      if (!list) {
        return next(new common.NotFound());
      }
      res.render(View.index, {
        pageTitle: 'Index', 
        entries: list.entries,
        prev: list.prev,
        next: list.next
      });
    });
  });
  
  // Index
  app.get(Mapping.index, function(req, res, next) {
    // /index/0/ is root
    if (req.params.offset == 0) {
      return res.redirect(Mapping.root);
    }
    blog.entry.list(req.params.offset, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(View.index, {
        pageTitle: 'Index', 
        entries: list.entries,
        prev: list.prev,
        next: list.next
      });
    });
  });

  // Show entry
  app.get(Mapping.entry, function(req, res, next) {
    blog.entry.get(req.params.id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(View.entry, {
        pageTitle: entry.title,
        msg: '',
        entry: entry,
        tbUrl: Conf.site.href.replace(/\/$/,  Mapping.trackback.replace(':id', entry.id)),
        entryUrl: Conf.site.href.replace(/\/$/,  Mapping.entry.replace(':id', entry.id)),
        prev: entry.prev,
        next: entry.next
      });
    });
  });

  // Add Comment
  app.post(Mapping.comment, function(req, res, next) {
    var comment = {  
      author: req.body.author,
      email: req.body.email,
      uri: req.body.uri,
      body: req.body.body
    };
    blog.entry.comment(req.params.id, comment, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('back');
    });
  });

  // Show category archives
  app.get(Mapping.category, function(req, res, next) {
    var id = req.params.id;
    if (isNaN(id) || /^0[0-9]+$/.test(id) || !Categories[id]) {
      res.redirect(Mapping.top);
    } else {
      var entries = [];
      var categoryEntries = Categories[id].entries;
      for (var i = 0; i < categoryEntries.length; i++) {
        entries.push(Entries[Entries.getIndex(categoryEntries[i])]);
      }
      res.render(View.category, {
        locals: initLocals({
          pageTitle: Categories[id].name,
          entries: entries
        })
      });
    }
  });

  // TrackBack
  app.post(Mapping.trackback, function(req, res, next) {
    var id = req.params.id;
    var index = Entries.getIndex(id);

    var title = req.body.title;
    var excerpt = req.body.excerpt;
    var url = req.body.url;
    var blog_name = req.body.blog_name;
    var date = new Date().toString();

    var ERROR_MSG = '<?xml version="1.0" encoding="UTF-8"?><response><error>1</error><message>TrackBack Error</message></response>';
    var SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><response><error>0</error></response>';
    res.contentType('application/xml');

    if (isNaN(id) || /^0[0-9]+$/.test(id) || index == -1 || !title || !excerpt || !url || !blog_name) {
      res.send(ERROR_MSG);
    } else {
      Entries[index].trackbacks += 1;
      fs.readFile(Path.entry + id + '.json', 'UTF-8', function(err, data) {
        if (err) {
          res.send(ERROR_MSG);
        } else {
          var entry = JSON.parse(data);
          entry.trackbacks.push({
            title: title,
            excerpt: common.makeExcerpt(excerpt),
            url: url,
            blog_name: blog_name, 
            date: date
          });
          fs.writeFile(Path.entry + id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
            if (err) {
              res.send(ERROR_MSG);
            } else {
              res.send(SUCCESS);
            }
          });
        }
      });
    }
  });
    
  require('./admin').set(app, siteDir, Path, Conf, Categories, Tags, Entries);
};
