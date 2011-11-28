var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(dir, models) {

  var self = this;

  var commentsDir = path.join(dir, '/data/comments/');

  var comments = [];

  // Load all files
  var files = fs.readdirSync(commentsDir);
  var jsonFiles = [];

  // Select only .json files
  for (var i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load comments
  for (var i = 0; i < jsonFiles.length; i++) {
    var comment = require(commentsDir + jsonFiles[i]);
    comments.push(comment);
  }

  /*
  // Sort by createdAt
  comments.sort(function(a, b) {
    var aDate = new Date(a.createdAt);
    var bDate = new Date(b.createdAt);
    return bDate - aDate;
  });
  */

  // Sort by id
  comments.sort(function(a, b) {
    var aId = a.id;
    var bId = b.id;
    return aId - bId;
  });

  this.gen = function(comment) {
   comment = {
      id: comment.id || nextId(),
      username: comment.username || '',
      body: comment.body || '',
      isPrivate: typeof comment.isPrivate == 'undefined' ? false : comment.isPrivate,
      createdAt: comment.createdAt || new Date(),
      updatedAt: comment.createdAt ? '' : new Date(),
      postId: comment.postId
    };
    return comment;
  };

  this.save = function(comment, cb) {
    comment = self.gen(comment);
    fs.writeFile(path.join(commentsDir, comment.id + '.json'), JSON.stringify(comment, null, '  '), 'UTF-8', function(err) {
      if (err) return cb(err);
      var index = idToIndex(comment.id);
      if (index < 0) {
        comments.push(comment);
      } else {
        comments[index] = comment;
      } 
      self.findById(comment.id, function(err, comment) {
        cb(null, comment);
      });
    });
  };

  this.remove = function(id, cb) {
    var filePath = path.join(path.join(commentsDir, id + '.json'));
    fs.unlink(filePath, function(err) {
      if (err) return cb(err);
      for (var i = 0; i < comments.length; i++) {
        if (comments[i].id == id) {
          comments.splice(i, 1);
          break;
        }
      }
      cb(null);
    });

  };

  this.findAll = function(cb) {
    cb(null, comments.slice());
  };

  this.findAllSync = function(cb) {
    return comments.slice();
  };

  this.findById = function(id, cb) {
    var comment = comments[idToIndex(id)];
    cb(null, setRelation([comment])[0]);
  };

  this.findByPostId = function(postId, cb) {
    var results = [];
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      if (comment.postId == postId) {
        results.push(comment);
      } 
    } 
    cb(null, setRelation(results));
  };

  /*
  this.findByUsernameAndIsPrivate = function(username, isPrivate, cb) {
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.username  == username) {
        models.Post.countByUserIdAndIsPrivate(user.id, isPrivate, function(err, count) {
          user.posts = count;
          cb(null, setRelation([user])[0]);
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
          cb(null, setRelation([user])[0]);
        });
        break;
      } 
    } 
  };
  */

  function nextId() {
    var maxId = 0;
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      if (maxId < comment.id) {
        maxId = comment.id;
      }
    }
    return maxId + 1;
  }

  function idToIndex(id) {
    var index = -1;
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      if (id == comment.id) {
        index = i; 
        break;
      }
    }
    return index;
  }

  function setRelation(results) {
    /*
    for (var i = 0; i < results.length; i++) {
      var user = copyObj(results[i]);
      delete user.password;
      results[i] = user;
    }
    */
    return results;
  }

  return this;

}.bind({});


