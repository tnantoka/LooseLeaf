/* Route for public */

var fs = require('fs'),
  join = require('path').join,
  util = require('./util'),
  mapping = require('./mapping').get();

exports.set = function(app, blog) {

  /* Private fucntions */

  // Root(show offset 0)
  app.get(mapping.uri.root, function(req, res, next) {
    blog.entry.list(0, function(err, list) {
      if (err) {
        return next(new util.InternalServerError(err.message));
      }
      if (!list) {
        return next(new util.NotFound());
      }
      res.render(mapping.view.index, {
        pageTitle: 'Index', 
        entries: list.entries,
        prev: list.prev,
        next: list.next
      });
    });
  });
  
  // Index
  app.get(mapping.uri.index, function(req, res, next) {
    // /index/0/ is root
    if (req.params.offset == 0) {
      return res.redirect(mapping.uri.root);
    }
    blog.entry.list(req.params.offset, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.index, {
        pageTitle: 'Index', 
        entries: list.entries,
        prev: list.prev,
        next: list.next
      });
    });
  });

  // Show entry
  app.get(mapping.uri.entry, function(req, res, next) {
    blog.entry.get(req.params.id, function(err, entry) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.entry, {
        pageTitle: entry.title,
        entry: entry,
        tbUrl: entry.tbUrl,
        entryUrl: entry.entrUrl,
        prev: entry.prev,
        next: entry.next
      });
    });
  });

  // Add comment
  app.post(mapping.uri.comment, function(req, res, next) {
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
  app.get(mapping.uri.category, function(req, res, next) {
    blog.category.list(req.params.id, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.category, {
        pageTitle: list.name,
        entries: list.entries
      });
    });
  });

  // Show tag archives
  app.get(mapping.uri.tag, function(req, res, next) {
    blog.tag.list(req.params.tag, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.tag, {
        pageTitle: list.name,
        entries: list.entries
      });
    });
  });

  // Show monthly archives
  app.get(mapping.uri.monthly, function(req, res, next) {
    blog.archive.monthly(req.params.year, req.params.month, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.monthly, {
        pageTitle: list.name,
        year: list.year,
        month: list.month,
        entries: list.entries
      });
    });
  });

  // Show daily archives
  app.get(mapping.uri.daily, function(req, res, next) {
    blog.archive.daily(req.params.year, req.params.month, req.params.date, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.daily, {
        pageTitle: list.name,
        year: list.year,
        month: list.month,
        entries: list.entries
      });
    });
  });
  
  // Show calendar
  app.get(mapping.uri.calendar, function(req, res, next) {
    blog.archive.calendar(req.params.year, req.params.month, function(err, year, month) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.calendar, {
//        layout: false,
        pageTitle: year + '-' + month,
        year: year,
        month: month
      });
    });
  });

  // Show searh result
  app.get(mapping.uri.search, function(req, res, next) {
    blog.entry.search(req.query.q, function(err, list) {
      if (err) {
        return next(err);
      }
      res.render(mapping.view.search, {
        pageTitle: list.words.join(' '),
        entries: list.entries
      });      
    });
  });

  // Receive trackback
  app.post(mapping.uri.trackback, function(req, res, next) {
    var trackback = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      url: req.body.url,
      blog_name: req.body.blog_name,
      date: new Date().toString()
    }  
    blog.entry.trackback(req.params.id, trackback, function(err) {
      res.contentType(blog.entry.trackback.MIMETYPE);
      if (err) {
        return res.send(blog.entry.trackback.ERROR);
      }
      res.send(blog.entry.trackback.SUCCESS);
    });
  });

};
