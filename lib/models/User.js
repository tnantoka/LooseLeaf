var path = require('path');

module.exports = function(dir) {

  this.shcema = function() {
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
}


}.bind({});

function nextId(dir) {
//  一番maxのやつの次
}

