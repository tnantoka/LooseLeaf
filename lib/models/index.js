var path = require('path');
var persistence = require('../ext/persistencejs/lib/persistence').persistence;
var persistenceStore = require('../ext/persistencejs/lib/persistence.store.sqlite');

module.exports = function(dir, isSync) {

  console.log('database file: ', path.join(dir, path.basename(dir) + '.db'));
  persistenceStore.config(persistence, path.join(dir, path.basename(dir) + '.db'));
 
  this.Post = persistence.define('posts', {
    title: "TEXT",
    body: "TEXT",
    is_private: "BOOL",
    created_at: "DATE",
    updated_at: "DATE"
  });

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

