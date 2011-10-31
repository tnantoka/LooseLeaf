var path = require('path');
var fs = require('fs');

module.exports = function(dir) {

  var usersDir = path.join(dir, '/data/users/');

  var users = [];

  // Load all files
  var files = fs.readdirSync(usersDir);
  var jsonFiles = [];

  // Select only .json files
  for (i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load users
  for (i = 0; i < jsonFiles.length; i++) {
    var user = require(usersDir + jsonFiles[i]);
    users.push(user);
  }
  console.log(users);

  this.schema = function() {
    return {
      username: '',
      password: '',
      fullname: '',
      intro: '',
      icon: '',
      color: '',
      isAdmin: '',
      createdAt: '',
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

  this.findByUsernameAndPassword = function(username, password, cb) {
    results = [];
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      if (user.username  == username && user.password == password) {
        results.push(user);
      } 
    } 
    cb(null, results[0]); 
    
  };

  return this;

}.bind({});

function nextId(dir) {
//  一番maxのやつの次
}

