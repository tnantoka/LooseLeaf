var path = require('path');
var persistence = require('../ext/persistencejs/lib/persistence').persistence;
var persistenceStore = require('../ext/persistencejs/lib/persistence.store.sqlite');

module.exports = function(dir) {

  console.log('database file: ', path.join(dir, path.basename(dir) + '.db'));
  persistenceStore.config(persistence, path.join(dir, path.basename(dir) + '.db'));
 
  this.Post = persistence.define('posts', {
    title: "TEXT",
    body: "TEXT",
    created_at: "DATE",
    updated_at: "DATE",
    is_private: "BOOL"
  });

  var session = persistenceStore.getSession();
  session.transaction(function(tx) {
    session.schemaSync(tx, function() {
      session.close();
    });
  });

  this.getSession = function() {
    return persistenceStore.getSession();
  };

  this.ACSC = true;
  this.DESC = false;

  return this;

}.bind({});

