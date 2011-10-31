var path = require('path');
var fs = require('fs');

module.exports = function(dir) {

  var postsDir = path.join(dir, '/data/posts/');

  var posts = [];

  // Load all files
  var files = fs.readdirSync(postsDir);
  var jsonFiles = [];

  // Select only .json files
  for (i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load posts
  for (i = 0; i < jsonFiles.length; i++) {
    var post = require(postsDir + jsonFiles[i]);
    posts.push(post);
  }

  // Sort by created
  posts.sort(function(a, b) {
    var aDate = new Date(a.createAt);
    var bDate = new Date(b.createAt);
    return bDate - aDate;
  });

  console.log(posts);

  this.schema = function() {
    return {
      title: '',
      body: '',
      tag: '',
      isPrivate: '',
      createdAt: new Date(),
      updatedAt: '' 
    };
  };

  this.save = function(user) {
    if (user.id) {
      // nextId読んでuser.idにセットして保存
    } else {
      // idのファイルに保存
    }
  };

  this.remove = function(user) {

  };

  this.findById = function(id) {
  };

  this.findByIsPrivate = function(isPrivate, limit, offset, cb) {
    results = [];
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (post.isPrivate == isPrivate) {
        results.push(post);
      } 
    } 
    cb(null, results.slice(offset, limit)); 
  };

  function nextId(dir) {
  //  一番maxのやつの次
  }

  return this;

}.bind({});


