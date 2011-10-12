/* Blog posts */
var fs = require('fs');
var path = require('path');
var ll = require('../llutils');
var async = require('async');

module.exports = function(dir) {

  // Load entries (On memory cache)
  var files = ll.loadFiles(path.join(dir, 'data/posts'));
  var posts = [];
  files.forEach(function(file) {
    posts.push(JSON.parse(file));
  });

  /* private method */

  // Posts with private flag is false
  function getPublics() {
    var publics = [];
    posts.forEach(function(post) {
      publics.unshift(post);
    });
    return publics;
  }

  // Max of post's id or 1
  function generateId() {
    if (post.length == 0) {
      return 1;
    }
    var ids = [];
      for (var i = 0; i < entries.length; i++) {
        ids.push(entries[i].id);
      }
      return Math.max.apply(null, ids) + 1;
    }
  }

  // Public entry with limit & offset
  this.findAll = function(limit, offset, fn) {
    var publics = getPublics();
    var results = [];
    var start = valid.offset * limit;
    for (var i = start; i < start + limit; i++) {
      if (publics[i]) {
        list.push(publics[i]);
      }
    }
    fn(null, results);
  };

  // nEW Model
  this.mew = function(post) {
    post = post || {};
    post = {
      id: post.id || ,
      title: entry.title,
      date: util.toReadableDate(entry.date),
      update: util.toReadableDate(entry.update),
      category: entry.category,
      tags: entry.tags,
      comments: entry.comments.length,
      trackbacks: entry.trackbacks.length,
      trackback_to: entry.trackback_to,
      opening: util.makeOpening(entry.body),
      uuid: entry.uuid,
    }
  };

  this.valid = function(post) {
  };

  this.save = function(post) {
  };

  this.findAllIncludePrivate = function(limit, offset, fn) {
  };
  
  return this;

}.bind({});

