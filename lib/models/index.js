var path = require('path');
var persistence = require('../ext/persistencejs/lib/persistence').persistence;
var persistenceStore = require('../ext/persistencejs/lib/persistence.store.sqlite');
//persistence.search = require('../ext/persistencejs/lib/persistence.search');
//persistence.search.config(persistence, persistenceStore);
//delete window; // define as global in pesistece.search.js

module.exports = function(dir, isSync) {

  var config = require('../wrappers/config')(dir);

  persistenceStore.config(persistence, path.join(dir, config.db.name + '.db'));
 
  this.Post = persistence.define('posts', {
    title: "TEXT",
    body: "TEXT",
    tag: "TEXT",
    is_private: "BOOL",
    created_at: "DATE",
    updated_at: "DATE"
  });
//  this.Post.textIndex('title');
//  this.Post.textIndex('body');
//  this.Post.textIndex('tag');

  this.User = persistence.define('users', {
    username: "TEXT",
    password: "TEXT",
    icon: "TEXT",
    is_admin: "BOOL",
    created_at: "DATE",
    updated_at: "DATE"
  });
  this.User.hasMany('posts', this.Post, 'user');


  if (isSync) {
    var session = persistenceStore.getSession();
    session.transaction(function(tx) {
      session.schemaSync(tx, function() {
        session.close();
      });
    });
  }

  this.getSession = function() {
    return persistenceStore.getSession();
  };

  this.ACSC = true;
  this.DESC = false;

  return this;

}.bind({});

