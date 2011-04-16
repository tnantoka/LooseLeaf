/* Manage articles */

var fs = require('fs'),
  join = require('path').join;
  common = require('./common'),
  atom = require('./atom'),
  uuid = require('./atom/uuid');

// Constants
var LIMIT = 5;

exports.init = function(siteDir, conf) {
//TODO: mappingは別ファイルにする

  var Mapping = {
    entry: '/entry/:id/'
  };

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
  // TODO: Load all data(content)
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
  
  // check
  function checkCategoryId(id) {
    if (isNaN(id) || /^0[0-9]+$/.test(id) || !categories[id]) {
      return;
    }
    return {
      id: parseInt(id)
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
  
  function nextId() {
    if (entries.length == 0) {
      return 1;
    } else {
      var ids = [];
      for (var i = 0; i < entries.length; i++) {
        ids.push(entries[i].id);
      }
      return Math.max.apply(null, ids) + 1;
    }
  }

  function sendTrackback(tb, entry) {
    if (!tb) {
      return;
    }
    var urls = tb.split(/\n|\r\n|\r/);
    var content = 
      'title=' + encodeURIComponent(entry.title) +
      '&excerpt=' + encodeURIComponent(common.makeExcerpt(entry.body)) +
      '&url=' + encodeURIComponent(conf.site.href.replace(/\/$/,  Mapping.entry.replace(':id', entry.id))) +
      '&blog_name=' + encodeURIComponent(conf.site.name);
    for (var i = 0; i < urls.length; i++) {
      if (!urls[i]) {
        continue;
      }
      var url = require('url').parse(urls[i]);
      var options = {
        host: url.hostname,
        port: url.port || '80',
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      options.path += url.search || '';
      options.path += url.hash || '';
      var req = require('http').request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) { 
          console.log('response data: ' + chunk);
          // TODO: chunked
          // TODO: xml parsing
          var err = chunk.match(/<error>(.+?)<\/error>/);
          if (err && err[1] == '1') {
            var msg = chunk.match(/<message>(.+?)<\/message>/);
            console.log('[error] ' + msg[1]);
          }                    
        });
      });
      req.on('error', function (e) {
        console.log('[error] ' + e.message);
      });
      req.write(content);
      req.end();
    }
  }

  // Generate atom file
  function generateAtom() {

    var obj = {};
  
    obj.title = conf.site.name;
    obj.href = conf.site.href;
  
    obj.author = {
      name: conf.sidebar.author.name
    };
  
    // Recent entries
    var recent = [];
    for (var i = 0; i < LIMIT; i++) {
      if (entries[i]) {
        var entry = {};
        entry.title = entries[i].title;
        entry.href = conf.site.href.replace(/\/$/,  Mapping.entry.replace(':id', entries[i].id));
        entry.updated =  entries[i].date;
        entry.summary = entries[i].opening;
        entry.uuid = entries[i].uuid;
        recent.push(entry);
      }
    }
  
    obj.entries = recent;
    var atomString = atom.generate(obj);
    
    fs.writeFile(join(siteDir, 'public', 'atom.xml'), atomString, 'UTF-8', function(err) {
    });
  }
  
  /* Public methods */
  
  // entry
  blog.entry = {};
  
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

  blog.entry.trackback = function(id, trackback, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new common.NotFound(id));
    }
    for(var i in trackback) {
      if(!trackback[i]) {
        return fn(new common.BadRequest(id));
      }
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new common.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);
      entry.trackbacks.push({
        title: trackback.title,
        excerpt: common.makeExcerpt(trackback.excerpt),
        url: trackback.url,
        blog_name: trackback.blog_name, 
        date: trackback.date
      });
      fs.writeFile(path.entry + valid.id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          return fn(new common.InternalServerError(err.message));
        }
        entries[valid.index].trackbacks += 1;
      });
    });    
  };
  blog.entry.trackback.ERROR = '<?xml version="1.0" encoding="UTF-8"?><response><error>1</error><message>TrackBack Error</message></response>';
  blog.entry.trackback.SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><response><error>0</error></response>';
  blog.entry.trackback.MIMETYPE = 'application/xml';
  
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

  // category
  blog.category = {};

  blog.category.list = function(id, fn) {
    var valid = checkCategoryId(id);
    if (!valid) {
      return fn(new common.NotFound(id));
    }
    var list = [];
    for (var i = 0; i < categories[valid.id].entries.length; i++) {
      list.push(entries[toIndex(categories[valid.id].entries[i])]);
    }
    fn(null, {
      name: categories[valid.id].name,
      entries: list
    });
  };

  // Admin
  blog.entry.add = function(entry, fn) {
    var id = nextId();
    var date = new Date().toString();
    var uuidString = uuid.generate();
    entries.unshift({
      id: id,
      title: entry.title,
      date: common.toReadableDate(date),
      category: entry.category,
      tags: [],
      comments: 0,
      trackbacks: 0,
      opening: common.makeOpening(entry.body),
      uuid: uuidString
    });
    categories[entry.category].entries.unshift(id);
    var stored = {
      id: id,
      title: entry.title,
      date: date,
      category: entry.category,
      tags: [],
      body: entry.body,
      comments: [],
      trackbacks: [],
      trackback_to: entry.tb, //TODO
      uuid: uuidString
      // update: null
    };
    fs.writeFile(path.entry + id + '.json', JSON.stringify(stored, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new common.InternalServerError(err.message));
      }
      fn(null, stored);
      
      // Update atom (async)
      generateAtom();
            
      // Send trackback (aync)
      sendTrackback(entry.tb, stored);
    });
  };


  return blog;

};