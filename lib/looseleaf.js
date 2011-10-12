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

// Create looseleaf server
exports.init = function(argv, dir) {

  var app = module.exports = express.createServer();

  // Configuration
  app.configure(function(){
    app.use(express.logger({ 
      format: ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :response-time ":referrer" ":user-agent"' // Combined Log Format
    }));
    app.use(connectForm({ keepExtensions: true })); // For uploading files
    app.set('views', path.join(dir, 'views')); // Set view directory
    app.set('view engine', 'ejs'); // Set templete engine
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'your secret here' }));
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

  // Models
  var models = {};
  loadModules(path.join(__dirname, 'models'), models, dir); 
 
  // Controllers
  var controllers = {};
  loadModules(path.join(__dirname, 'controllers'), controllers, models); 
 
  // Routes
  require('./routes')(app, controllers, models);

  /* Start process */

  // Parse arguments 
  var args = argv.slice(2);
  var port = parseInt(models.config.site.port);
  var isDaemon;
  while (args.length) {
    switch (args.shift()) {
      case '-p':
      case '--port':
        port = args.shift();
        break;
      case '-d':
      case '--daemon':
        isDaemon = true;
        break;
      default:
        console.error('Usage: node app.js [--port=3000] [--daemon]');
        process.exit(1);
    }
  }

  // Return to app.js
  return {
    app: app,
    start: function() {
      app.listen(port);
      console.log('"' + models.config.site.name + '" server listening on port %d', app.address().port);
  
      if (models.config.admin.pass == 'pass') {
        console.log('[warning] Your password is default! Please change immediately!!');
      }

      if (isDaemon) {
        daemon.daemonize(path.join(dir, 'logs/looseleaf.log'), path.join(dir, 'pids/looseleaf.pid'), function (err, pid) {
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

// Load js files to container obj from dir
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
      var name = file.replace('.js', '') 
      container[name] = require(filePath)(args);
    }
  }
}

