var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(dir, models) {

  var self = this;

  var filesDir = path.join(dir, '/public/files/');

  var files = [];

  var users = [];

  this.init = function() {
    users = models.User.findAllSync();

    for (var i = 0; i < users.length; i++) {
      var userId = users[i].id;
      var userDir = path.join(filesDir, '/' + userId);
      try {
        fs.mkdirSync(userDir, 0755);
      } catch (e) {
        //console.log(e);
      }
      var userFiles = fs.readdirSync(userDir);
      for (var j = 0; j < userFiles.length; j++) {
        var filePath = path.join(userDir, userFiles[j]);
        if (/^\.+/.test(filePath)) {
          continue;
        }
        var stat = fs.statSync(filePath);
        stat.filename = userFiles[j]; 
        stat.user = users[i]; 
        files.push(stat);
      }
    }
    // Sort by created
    users.sort(function(a, b) {
      var aDate = new Date(a.cTime);
      var bDate = new Date(b.cTime);
      return bDate - aDate;
    });
  };

  this.save = function(tempfile, filename, user, cb) {
    var userDir = path.join(filesDir, '/' + user.id);
    var filePath = path.join(userDir, filename);
    fs.rename(tempfile, filePath, function(err) {
      if (err) return cb(err);
      var isUpdate;
      fs.stat(filePath, function(err, stats) {
        if (err) return cb(err);
        stats.filename = filename;
        stats.user = user;
        for (var i = 0; i < files.length; i++) {
          if (files[i].user.id == user.id && files[i].filename == filename) {
            isUpdate = true;
            files[i] = stats;
            break;
          }
        }
        if (!isUpdate) {
          files.push(stats);
        }
        cb(null, stats);
      });
    });
  };

  this.remove = function(filename, user, cb) {
    var userDir = path.join(filesDir, '/' + user.id);
    var filePath = path.join(userDir, filename);
    fs.unlink(filePath, function(err) {
      if (err) return cb(err);
      for (var i = 0; i < files.length; i++) {
        if (files[i].user.id == user.id && files[i].filename == filename) {
          files.splice(i, 1);
          break;
        }
      }
      cb(null);
    });
  };

  this.findAll = function(cb) {
    var results = files.slice();
    cb(null, results);
  };

  return this;

}.bind({});


