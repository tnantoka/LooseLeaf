/*
 * LooseLeaf: Lightweight blogging engine for node.js
 * http://looseleafjs.org/
 */

/* Load modules */
var fs = require('fs'),
  express = require('express'),
  form = require('connect-form'),
  join = require('path').join,
  mapping = require('./mapping').get(),
  daemon = require('daemon');

/* Define constants */
var VERSION = require('./package').version();

/* Create looseleaf server */
module.exports.init = function(siteDir) {

  // Search theme
  var themes = [];
  var tempThemes = fs.readdirSync(join(siteDir, 'public/theme'));
  for (var i = 0; i < tempThemes.length; i++) {
    if (!/^\.+/.test(tempThemes[i])) {
      themes.push(tempThemes[i]);
    }
  }

  /* Create express server */
  var app = express.createServer();

  /* Load JSON files */
  var conf = require('./conf').get(siteDir);

  /* Configure app */
  app.configure(function() {
  
    // Combined Log Format
    app.use(express.logger({ format: ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :response-time ":referrer" ":user-agent"' }));

    // For uploading files
    app.use(form({ keepExtensions: true }));

    // Set view directory
    app.set('views', join(siteDir, 'views'));  
    // Set templete engine
    app.set('view engine', 'ejs');

    // For session support
    app.use(express.cookieParser());
    app.use(express.session({secret: 'looseleafjs'}));

    // Parse HTTP
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    // session.regenerate() error occurs
    //  app.use(app.router);

    // Set static directory
    app.use(express.static(join(siteDir, 'public')));
  });

  // development mode(Default)
  app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    app.error(function(err, req, res, next) {
      // TODO: Status code
      res.render(mapping.view.error, {
        pageTitle: err,
        stack: err.stack
      });
    });
  });

  // production mode($ NODE_ENV=production node app.js)
  app.configure('production', function() {
    app.use(express.errorHandler()); 
    app.error(function(err, req, res, next) {
      // TODO: Status code
      res.render(mapping.view.error, {
        pageTitle: err,
        stack: ''
      });
    });
  });

  /* Init entry */
  var blog = require('./blog').init(siteDir, conf);
  
  /* Route */
  require('./public').set(app, blog);
  require('./admin').set(app, blog, conf);

  // Global variables for view
  app.dynamicHelpers({
    req: function(req, res) {
      return req;
    },
    site: function(req, res) {
      return conf.site;
    },
    copyright: function(req, res) {
      return conf.copyright;
    },
    globalNavi: function(req, res) {
      return conf.globalNavi;
    },
    sidebar: function(req, res) {
      return conf.sidebar;
    },
    version: function(req, res) {
      return VERSION;
    },
    blog: function(req, res) {
      return blog;
    },
    categories: function(req, res) {
      return blog.category.getAll();
    },
    tags: function(req, res) {
      return blog.tag.getAll();
    },
    recent: function(req, res) {
      return blog.entry.recent();
    },
    recentComments: function(req, res) {
      return blog.comment.recent();
    },
    recentTrackbacks: function(req, res) {
      return blog.trackback.recent();
    },
    mapping: function(req, res) {
      return mapping;
    },
    themes: function(req, res) {
      return themes;
    },
    calendar: function(req, res) {
      return blog.archive.getAll();
    }
  });  

  /* Return to app.js */
  return {
    app: app,
    conf: conf,
    listen: function(port, isDaemon) {
      app.listen(port);
      console.log('"' + conf.site.name + '" server listening on port %d', app.address().port);
  
      if (conf.admin.pass == 'pass') {
        console.log('[warning] Your password is default! Please change immediately!!');
      }

      if (isDaemon) {
        daemon.daemonize(siteDir + '/logs/looseleaf.log', siteDir + '/pids/looseleaf.pid', function (err, pid) {
          if (err) {
            console.error('Error starting daemon: ' + err);
            return;
          }
          console.log('Daemon started successfully with pid: ' + pid);
        });
      }
    }
  };
};
