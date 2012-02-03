/*
 * LooseLeaf: Lightweight blogging engine for node.js
 * http://looseleafjs.org/
 * (c) 2011- tnantoka
 */

// Load modules
var express = require('express');
var fs = require('fs');
var path = require('path');
var connectForm = require('connect-form');
//var FSStore = require('connect-fs')(express);

// Create looseleaf server
exports.init = function(dir) {

  var app = express.createServer();

  var config = require('./wrappers/config')(dir);

//  var sessionStore = new FSStore({ dir: path.join(dir, 'sessions') });

  // Configuration
  app.configure(function(){
    if (config.process.logging) {
      app.use(express.logger({ 
        format: ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :response-time ":referrer" ":user-agent"' // Combined Log Format
      }));
    }
    // file uploading
    app.use(connectForm({ 
      uploadDir: path.join(dir, 'public/files'), 
      keepExtensions: true
    }));
    app.set('views', path.join(dir, 'views')); // Set view directory
    app.set('view engine', 'ejs'); // Set templete engine
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: config.session.secret,
//      store: sessionStore,
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
      //cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 } // 1 day
    }));
    app.use(app.router);
    app.use(express.static(path.join(dir, 'public'))); // Set static directory
  });

  // Show stack trace in development
  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });

  // Only error message in production
  app.configure('production', function(){
    app.use(express.errorHandler()); 
  });

  /* Init application */

  require('./helpers')(app, config);

  // Models
  var models = {};
  loadModules(path.join(__dirname, 'models'), models, dir); 
  for (var model in models) {
    if (models[model].init) {
      models[model].init();
    }
  }
 
  // Controllers
  var controllers = {};
  loadModules(path.join(__dirname, 'controllers'), controllers, models); 
 
   // Routes
  require('./routes')(app, controllers, models);

  // Return to app.js
  return {
    app: app,
    start: function() {
      app.listen(config.process.port);
      console.log('"' + config.site.title + '" server listening on port %d', app.address().port);
    }
  };

};

// Load and require js files to container obj from dir
function loadModules(dir, container, args) {
  var files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      container[file] = {};
      loadModules(filePath, container[file], args);
      continue;
    }
    if (/.+\.js$/.test(file)) {
      var name = file.replace(/\.js$/, '') 
      container[name] = require(filePath)(args, container);
    }
  }
}

