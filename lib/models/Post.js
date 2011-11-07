var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(dir, models) {

  var self = this;

  var postsDir = path.join(dir, '/data/posts/');

  var posts = [];

  // Load all files
  var files = fs.readdirSync(postsDir);
  var jsonFiles = [];

  // Select only .json files
  for (var i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load posts
  for (var i = 0; i < jsonFiles.length; i++) {
    var post = require(postsDir + jsonFiles[i]);
    posts.push(post);
  }

  // Sort by created
  posts.sort(function(a, b) {
    var aDate = new Date(a.createdAt);
    var bDate = new Date(b.createdAt);
    return bDate - aDate;
  });

  this.gen = function(post, user) {
    post = {
      id: post.id || nextId(),
      title: post.title || '',
      body: post.body || '',
      tag: post.tag || '',
      alias: post.alias || '',
      isPrivate: typeof post.isPrivate == 'undefined' ? true : post.isPrivate,
      createdAt: post.createdAt || new Date(),
      updatedAt: post.createdAt ? '' : new Date(),
      userId: post.userId || (user ? user.id : '')
    };
    return post;
  };

  this.save = function(post, user, cb) {
    post = self.gen(post, user);
    fs.writeFile(path.join(postsDir, post.id + '.json'), JSON.stringify(post, null, '  '), 'UTF-8', function(err) {
      if (err) return cb(err);
      var index = idToIndex(post.id);
      if (index < 0) {
        posts.unshift(post);
      } else {
        posts[index] = post;
      } 
      self.findById(post.id, function(err, post) {
        cb(null, post);
      });
    });
  };

  this.remove = function(post, cb) {
    fs.unlink(path.join(postsDir, post.id + '.json'), function(err) {
      if (err) return cb(err);
      var index = idToIndex(post.id);
      posts.splice(index, 1);
      cb(null)
    });
  };

  this.findById = function(id, cb) {
    var post = posts[idToIndex(id)];
    models.User.findById(post.userId, function(err, user) {
      post.user = user;
      cb(null, post);
    });
  };

  this.findByIsPrivate = function(isPrivate, limit, offset, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.isPrivate == isPrivate || isPrivate == null) {
        results.push(post);
      } 
    } 
    if (offset != null && limit != null) results = results.slice(offset, offset + limit);
    async.forEach(results, function(post, callback) {
      models.User.findById(post.userId, function(err, user) {
        post.user = user;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  this.findByUserId = function(userId, limit, offset, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.userId == userId) {
        results.push(post);
      } 
    } 
    if (offset != null && limit != null) results = results.slice(offset, offset + limit);
    async.forEach(results, function(post, callback) {
      models.User.findById(post.userId, function(err, user) {
        post.user = user;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  this.countByUserId = function(userId, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.userId == userId) {
        results.push(post);
      } 
    } 
    cb(null, results.length); 
  };

  this.countByUserIdAndIsPrivate = function(userId, isPrivate, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.userId == userId) {
        if (post.isPrivate == isPrivate || isPrivate == null) {
          results.push(post);
        } 
      } 
    } 
    cb(null, results.length); 
  };

  this.findByUserIdAndIsPrivate = function(userId, isPrivate, limit, offset, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.userId == userId) {
        if (post.isPrivate == isPrivate || isPrivate == null) {
          results.push(post);
        } 
      } 
    } 
    if (offset != null && limit != null) results = results.slice(offset, offset + limit);
    async.forEach(results, function(post, callback) {
      models.User.findById(post.userId, function(err, user) {
        post.user = user;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  this.searchByIsPrivate = function(keyword, isPrivate, limit, offset, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.title.indexOf(keyword) > -1 || post.body.indexOf(keyword) > -1 || post.tag.indexOf(keyword) > -1 || post.alias.indexOf(keyword) > -1) {
        if (post.isPrivate == isPrivate || isPrivate == null) {
          results.push(post);
        } 
      } 
    } 
    if (offset != null && limit != null) results.slice(offset, offset + limit);
    async.forEach(results, function(post, callback) {
      models.User.findById(post.userId, function(err, user) {
        post.user = user;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  this.searchByTagAndIsPrivate = function(keyword, isPrivate, limit, offset, cb) {
    var results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.tag.indexOf(keyword) > -1) {
        if (post.isPrivate == isPrivate || isPrivate == null) {
          results.push(post);
        } 
      } 
    } 
    if (offset != null && limit != null) results = results.slice(offset, limit);
    async.forEach(results, function(post, callback) {
      models.User.findById(post.userId, function(err, user) {
        post.user = user;
        callback(null);
      });
    }, function(err) { 
      if (err) return cb(err);
      cb(null, results); 
    });
  };

  function nextId() {
    var maxId = 0;
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (maxId < post.id) {
        maxId = post.id;
      }
    }
    return maxId + 1;
  }

  function idToIndex(id) {
    var index = -1;
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (id == post.id) {
        index = i; 
        break;
      }
    }
    return index;
  }

  return this;

}.bind({});


