var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(dir, models) {

  var self = this;

  var usersDir = path.join(dir, '/data/users/');

  var users = [];

  // Load all files
  var files = fs.readdirSync(usersDir);
  var jsonFiles = [];

  // Select only .json files
  for (var i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load users
  for (var i = 0; i < jsonFiles.length; i++) {
    var user = require(usersDir + jsonFiles[i]);
    users.push(user);
  }

  // Sort by created
  users.sort(function(a, b) {
    var aId = a.id;
    var bId = b.id;
    return aId - bId;
  });

  this.gen = function(user) {
    user = {
      id: user.id || nextId(),
      username: user.username || '',
      password: user.password || '',
      fullname: user.fullname || '',
      intro: user.intro || '',
      icon: user.icon || '',
      color: user.color || '',
      isAdmin: user.isAdmin || '',
      createdAt: user.createdAt || new Date(),
      updatedAt: user.createdAt ? '' : new Date()
    };
    return user;
  };

  this.save = function(user, cb) {
    user = self.gen(user);
    fs.writeFile(path.join(usersDir, user.id + '.json'), JSON.stringify(user, null, '  '), 'UTF-8', function(err) {
      if (err) return cb(err);
      var index = idToIndex(user.id);
      if (index < 0) {
        users.push(user);
      } else {
        users[index] = user;
      } 
      self.findById(user.id, function(err, user) {
        cb(null, user);
      });
    });
  };

  this.remove = function(user) {

  };

  this.findAllSync = function(cb) {
    return users.slice();
  };

  this.findById = function(id, cb) {
    var user = users[idToIndex(id)];
    models.Post.countByUserId(user.id, function(err, count) {
      user.posts = count;
      cb(null, user);
    });
  };

  this.findByIdAndIsPrivate = function(id, isPrivate, cb) {
    var user = users[idToIndex(id)];
    models.Post.countByUserIdAndIsPrivate(user.id, isPrivate, function(err, count) {
      user.posts = count;
      cb(null, user);
    });
  };

  this.findByIsPrivate = function(isPrivate, cb) {
    var results = users.slice();
    async.forEach(results, function(user, callback) {
      models.Post.countByUserIdAndIsPrivate(user.id, isPrivate, function(err, count) {
        user.posts = count;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  this.findByUsernameAndPassword = function(username, password, cb) {
    var results = [];
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.username  == username && user.password == password) {
        results.push(user);
      } 
    } 
    cb(null, results[0]); 
  };

  this.findByUsernameAndIsPrivate = function(username, isPrivate, cb) {
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.username  == username) {
        models.Post.countByUserIdAndIsPrivate(user.id, isPrivate, function(err, count) {
          user.posts = count;
          cb(null, user);
        });
        break;
      } 
    } 
  };

  this.findByUsername = function(username, cb) {
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.username  == username) {
        models.Post.countByUserId(user.id, function(err, count) {
          user.posts = count;
          cb(null, user);
        });
        break;
      } 
    } 
  };

  function nextId() {
    var maxId = 0;
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (maxId < user.id) {
        maxId = user.id;
      }
    }
    return maxId + 1;
  }

  function idToIndex(id) {
    var index = -1;
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (id == user.id) {
        index = i; 
        break;
      }
    }
    return index;
  }

  return this;

}.bind({});


