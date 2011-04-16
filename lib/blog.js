/* Manage articles */

var fs = require('fs'),
  join = require('path').join;
 common = require('./common');

// Constants
var LIMIT = 5;

exports.init = function(siteDir) {

  var blog = {};  
  var cache; // :memoryでやる？
  
  // File paths
  var path = {
    conf: join(siteDir, 'conf.json'),
    entry: join(siteDir, '/data/entry/'),
    category: join(siteDir, '/data/meta/category.json'),
    tag: join(siteDir, '/data/meta/tag.json'),
    file: join(siteDir, '/public/file/')
  };
  
  /* Initialize */
  
  // Init entries
  var entries = [];

  // Load all files
  var files = fs.readdirSync(path.entry);
  var jsonFiles = [];

  // Select only .json files
  for (i = 0; i < files.length; i++) {
    if (/\.json$/.test(files[i])) {
       jsonFiles.push(files[i]);
    }
  }

  // Load entry's meta data
  // TODO: Load all data(content(
  for (i = 0; i < jsonFiles.length; i++) {
    var entry = JSON.parse(fs.readFileSync(path.entry + jsonFiles[i]));
    entries.push({
      id: entry.id,
      title: entry.title,
      date: common.toReadableDate(entry.date),
      update: common.toReadableDate(entry.update),
      category: entry.category,
      tags: entry.tags,
      comments: entry.comments.length,
      trackbacks: entry.trackbacks.length,
      trackback_from: [], //TODO
      trackback_to: [], //TODO
      opening: common.makeOpening(entry.body),
      uuid: entry.uuid
    });
  }

  // Descending sort by date
  entries.sort(function(a, b) {
    var aDate = new Date(a.date);
    var bDate = new Date(b.date);
    return bDate - aDate;
  });
      
      
  // Init categories
  var categories = JSON.parse(fs.readFileSync(path.category, 'UTF-8')); 
  for (var i in categories) {
    if (categories.hasOwnProperty(i)) {
      categories[i].entries = [];  
    }
  }
  for (var i = 0; i < entries.length; i++) {
    categories[entries[i].category].entries.push(entries[i].id);
  } 
  blog.categories = categories;
  
  /* Private methods */
  
  // Get entry's index in entries array
  function toIndex(id) {
    for (var i = 0; i < entries.length; i++) {
      if (id == entries[i].id) {
        return i;
      }
    }
    return -1;
  };

  // check
  function checkEntryId(id) {
    var index = toIndex(id);
    if (isNaN(id) || /^0/.test(id) || index == -1) {
      return;
    }
    return {
      id: parseInt(id),
      index: index
    };
  }
  
  function checkEntryOffset(offset) {
    console.log('offset', offset);
    if ((isNaN(offset) || /^0[0-9]/.test(offset) || offset < 0 || offset >= entries.length / LIMIT) && entries.length !== 0) {
      return;
    }
    return {
      offset: parseInt(offset)
    };
  }

  /* Public methods */
  blog.entry = entry = {};
  
  blog.entry.get = function(id, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new common.NotFound(id));
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new common.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);  
      entry.date = entries[valid.index].date; // for readable
      entry.update = entries[valid.index].update; // for readbale
      entry.prev = valid.index - 1 >= 0 ? entries[valid.index - 1] : null,
      entry.next = valid.index + 1 < entries.length ? entries[valid.index + 1] : null      
      fn(null, entry);
    });
  };

  blog.entry.comment = function(id, comment, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new common.NotFound(id));
    }
    for(var i in comment) {
      if(!comment[i]) {
        return fn(new common.BadRequest(id));
      }
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new common.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);
      entry.comments.push({
        author: comment.author,
        email: comment.email,
        uri: comment.uri,
        body: comment.body, 
         date: new Date().toString()
      });
      fs.writeFile(path.entry + valid.id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          return fn(new common.InternalServerError(err.message));
        }
        entries[valid.index].comments += 1;
        fn(null);
      });
    });
  };
  
  blog.entry.list = function(offset, fn) {
    var valid = checkEntryOffset(offset);
    if (!valid) {
      return fn(new common.NotFound(id));
    }
    var list = [];
    var start = valid.offset * LIMIT;
    for (var i = start; i < start + LIMIT; i++) {
      if (entries[i]) {
        list.push(entries[i]);
      }
    }
    fn(null, {
      entries: list,
      prev: valid.offset - 1 >= 0 ? valid.offset - 1 : null,
      next: valid.offset + 1 < entries.length / LIMIT ? valid.offset + 1 : null
    });
  };
  
  
  blog.entry.recent = function() {
    var recent = [];
    for (var i = 0; i < LIMIT; i++) {
      if (entries[i]) {
        recent.push(entries[i]);
      }
    }
    return recent;
  };

  blog.entry.add = function(entry, fn) {
  };

  return blog;

};