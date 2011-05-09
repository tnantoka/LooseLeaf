/* Manage articles */

var fs = require('fs'),
  join = require('path').join, 
  util = require('./util'),
  atom = require('./atom'),
  uuid = require('node-uuid'),
  mapping = require('./mapping').get(),
  Deferred = require('./jsdeferred').Deferred,
  segmenter = require('./tinysegmenter').segmenter;
  
Deferred.define();

// Constants
var LIMIT = 5;

exports.init = function(siteDir, conf) {

  var blog = {};  
  
  // File paths
  var path = {
    entry: join(siteDir, '/data/entry/'),
    category: join(siteDir, '/data/meta/category.json'),
    tag: join(siteDir, '/data/meta/tag.json'),
    file: join(siteDir, '/public/file/'),
    conf: join(siteDir, 'conf.json')
  };
  
  /* Initialize */
  
  // Init entries, comments, categories
  var entries = [];
  var comments = [];
  var trackbacks = [];
  var categories = JSON.parse(fs.readFileSync(path.category));
  // Init categories (set empty to entries)
  for (var i in categories) {
    if (categories.hasOwnProperty(i)) {
      categories[i].entries = [];
    }
  }
  var calendar = {};
  var segments = {};
  var published = [];
  var tags = {};
  
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
  for (i = 0; i < jsonFiles.length; i++) {
    var entry = JSON.parse(fs.readFileSync(path.entry + jsonFiles[i]));
    entries.push({
      id: entry.id,
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
      private: entry.private
    });
    
    for (var j = 0; j < entry.comments.length; j++) {
      comments.push({
        author: entry.comments[j].author,
//        email: entry.comments[j].email,
//        uri: entry.comments[j].uri,
//        body: entry.comments[j].body, 
        date: util.toReadableDate(entry.comments[j].date),
        id: entry.id
      });
    }
    for (var j = 0; j < entry.trackbacks.length; j++) {
      trackbacks.push({
//        title: entry.trackbacks[j].title,
//        excerpt: entry.trackbacks[j].excerpt,
//        url: entry.trackbacks[j].url,
        blog_name: entry.trackbacks[j].blog_name, 
        date: entry.trackbacks[j].date,
        id: entry.id
      });
    }
    
    if (!entry.private) {
      addCalendar(entry);  
      addSegments(entry);
    }
  }
  
  // Descending sort by date
  entries.sort(function(a, b) {
    var aDate = new Date(a.date);
    var bDate = new Date(b.date);
    return bDate - aDate;
  });
  
  comments.sort(function(a, b) {
    var aDate = new Date(a.date);
    var bDate = new Date(b.date);
    return bDate - aDate;
  });

  trackbacks.sort(function(a, b) {
    var aDate = new Date(a.date);
    var bDate = new Date(b.date);
    return bDate - aDate;
  });

  // Init meta info after sort entry
  for (var i = 0; i < entries.length; i++) {
    categories[entries[i].category].entries.push(entries[i].id);  
    if (!entries[i].private) {
      published.push(entries[i].id);
    }
  }
  
  updateTags();
      
  /* Private methods */
  
  // Get entry's index in entries array
  function toIndex(id) {
    for (var i = 0; i < entries.length; i++) {
      if (id == entries[i].id && !entries[i].draft) {
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
  
  function checkCategoryId(id) {
    if (isNaN(id) || /^0[0-9]+$/.test(id) || !categories[id]) {
      return;
    }
    return {
      id: parseInt(id)
    };
  }
  
  function checkEntryOffset(offset) {
    if ((isNaN(offset) || /^0[0-9]/.test(offset) || offset < 0 || offset >= published.length / LIMIT) && published.length !== 0) {
      return;
    }
    return {
      offset: parseInt(offset)
    };
  }

  function checkMonth(year, month) {
    if (isNaN(year) || isNaN(month) || !calendar[year] || !calendar[year][month]) {
      return;
    }
    return {
      year: parseInt(year),
      month: parseInt(month)
    };
  }

  function checkDate(year, month, date) {
    if (isNaN(year) || isNaN(month) || isNaN(date) || !calendar[year] || !calendar[year][month] || !calendar[year][month][date]) {
      return;
    }
    return {
      year: parseInt(year),
      month: parseInt(month),
      date: parseInt(date)
    };
  }

  function checkCalendar(year, month) {
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return;
    }
    return {
      year: parseInt(year),
      month: parseInt(month)
    };
  }
  
  function nextEntryId() {
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

  function nextCategoryId() {
    var ids = [];
    for (var i in categories) {
      if (categories.hasOwnProperty(i)) {
        ids.push(i);
      }
    }
    return Math.max.apply(null, ids) + 1;
  }

  // Add entry to calendr
  function addCalendar(entry) {
    var date = new Date(entry.date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();

    if (!calendar[y]) {
      calendar[y] = {};
    }
    if (!calendar[y][m]) {
      calendar[y][m] = {};
    }
    if (calendar[y][m][d]) {
      calendar[y][m][d].unshift(entry.id);
    } else {
      calendar[y][m][d] = [entry.id];        
    }
  }

  // Analyze entry for segments
  function addSegments(entry) {
    var segs = segmenter.segment(entry.body);
    segs = segs.concat(segmenter.segment(entry.title));
    var u_segs = {};
    for (var i = 0; i < segs.length; i++) {
      u_segs[segs[i]] = 1;
    }
    for (var seg in u_segs) {
      if (u_segs.hasOwnProperty(seg)) {
        if (segments[seg]) {
          segments[seg].push(entry.id);
        } else {
          segments[seg] = [entry.id];
        }
      }
    }
  }

  // Get next entry of specified　index
  function nextEntry(index) {
    for (var i = index + 1; i < entries.length; i++) {
      if (!entries[i].draft) {
        return entries[i];
      }
    }
  } 

  // Send trackbak
  function sendTrackback(tb, entry) {
    if (!tb) {
      return;
    }
    var urls = tb.split(/\n|\r\n|\r/);
    var content = 
      'title=' + encodeURIComponent(entry.title) +
      '&excerpt=' + encodeURIComponent(util.makeExcerpt(entry.body)) +
      '&url=' + encodeURIComponent(conf.site.href.replace(/\/$/,  mapping.uri.entry.replace(':id', entry.id))) +
      '&blog_name=' + encodeURIComponent(conf.site.name);
    for (var i = 0; i < urls.length; i++) {
      if (!urls[i]) {
        continue;
      }
      util.POST(urls[i], content).next(function(data) {
        var err = data.match(/<error>(.+?)<\/error>/);
        if (err && err[1] == '1') {
          var msg = data.match(/<message>(.+?)<\/message>/);
          console.error('[error] ' + msg[1] + ': ' + data.url);
        }                    
      }).error(function (err) {
        console.error('[error] ' + err.message + ': ' + err.url);
      });
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
      if (published[i]) {
        var index = toIndex(published[i]);
        
        var entry = {};
        entry.title = entries[index].title;
        entry.href = conf.site.href.replace(/\/$/,  mapping.uri.entry.replace(':id', entries[index].id));
        entry.updated =  entries[index].date;
        entry.summary = entries[index].opening;
        entry.uuid = entries[index].uuid;
        recent.push(entry);
      }
    }
  
    obj.entries = recent;
    var atomString = atom.generate(obj);
    
    fs.writeFile(join(siteDir, 'public', 'atom.xml'), atomString, 'UTF-8', function(err) {
    });
  }
  
  function splitTag(tag) {
    return tag.split(/[,，、][\s　]*/);
  }
  
  function updateTags() {
    tags = {};
    for (var i = 0; i < published.length; i++) {
      var entry = entries[toIndex(published[i])];
      for (var j = 0; j < entry.tags.length; j++) {
        if (!entry.tags[j]) {
          continue
        }
        if (tags[entry.tags[j]]) {
          tags[entry.tags[j]].push(entry.id);
        } else {
          tags[entry.tags[j]] = [entry.id];          
        }
      }
    }
  }
  
  
  /* Public methods */
  
  // entry
  blog.entry = {};
  
  blog.entry.get = function(id, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new util.NotFound('Entry id: ' + id));
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);  
      entry.date = entries[valid.index].date; // for readable
      entry.update = entries[valid.index].update; // for readbale
      entry.prev = valid.index - 1 >= 0 ? entries[valid.index - 1] : null,
      entry.next = valid.index + 1 < entries.length ? nextEntry(valid.index) : null      
      entry.tbUrl = conf.site.href.replace(/\/$/,  mapping.uri.trackback.replace(':id', entry.id));
      entry.entryUrl = conf.site.href.replace(/\/$/,  mapping.uri.entry.replace(':id', entry.id));
      fn(null, entry);
    });
  };

  blog.entry.getTitle = function(id) {
    var valid = checkEntryId(id);
    if (!valid) {
      return '';
    }
    return entries[valid.index].title;
  };

  blog.entry.comment = function(id, comment, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new util.NotFound('Entry id: ' + id));
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);
      var date = new Date().toString();
      entry.comments.push({
        author: comment.author,
        email: comment.email,
        uri: comment.uri,
        body: comment.body, 
        date: date
      });
      comments.unshift({
        author: comment.author,
//        email: comment.email,
//        uri: comment.uri,
//        body: comment.body, 
        date: util.toReadableDate(date),
        id: valid.id        
      });
      fs.writeFile(path.entry + valid.id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          return fn(new util.InternalServerError(err.message));
        }
        entries[valid.index].comments += 1;
        fn(null, valid.id);
      });
    });
  };

  blog.entry.trackback = function(id, trackback, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new util.NotFound('Entry id: ' + id));
    }
    for(var i in trackback) {
      if(!trackback[i]) {
        return fn(new util.BadRequest('Entry id: ' + id));
      }
    }
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      var entry = JSON.parse(data);
      entry.trackbacks.push({
        title: trackback.title,
        excerpt: util.makeExcerpt(trackback.excerpt),
        url: trackback.url,
        blog_name: trackback.blog_name, 
        date: trackback.date
      });
      trackbacks.unshift({
//        title: trackback.title,
//        excerpt: util.makeExcerpt(trackback.excerpt),
//        url: trackback.url,
        blog_name: trackback.blog_name, 
        date: trackback.date,
        id: valid.id        
      });
      fs.writeFile(path.entry + valid.id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          return fn(new util.InternalServerError(err.message));
        }
        entries[valid.index].trackbacks += 1;
        fn(null);
      });
    });    
  };
  blog.entry.trackback.ERROR = '<?xml version="1.0" encoding="UTF-8"?><response><error>1</error><message>TrackBack Error</message></response>';
  blog.entry.trackback.SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><response><error>0</error></response>';
  blog.entry.trackback.MIMETYPE = 'application/xml';
  
  blog.entry.list = function(offset, fn) {
    var valid = checkEntryOffset(offset);
    if (!valid) {
      return fn(new util.NotFound('offset: ' + offset));
    }
    var list = [];
    var start = valid.offset * LIMIT;
    for (var i = start; i < start + LIMIT; i++) {
      if (published[i]) {
        list.push(entries[toIndex(published[i])]);
      }
    }
    fn(null, {
      entries: list,
      prev: valid.offset - 1 >= 0 ? valid.offset - 1 : null,
      next: valid.offset + 1 < published.length / LIMIT ? valid.offset + 1 : null
    });
  };
  
  blog.entry.recent = function() {
    var recent = [];
    for (var i = 0; i < LIMIT; i++) {
      if (published[i]) {
        recent.push(entries[toIndex(published[i])]);
      }
    }
    return recent;
  };

  blog.entry.search = function(words, fn) {
    var segs = segmenter.segment(words);
    var list = [];
    var ids = {};
    for (var i = 0; i < segs.length; i++) {
       if (segments[segs[i]]) {
          for (var j = 0; j < segments[segs[i]].length; j++) {
            ids[segments[segs[i]][j]] = 1;
          }
       }
    }
    for (var id in ids) {
      if (ids.hasOwnProperty(id)) {
        list.push(entries[toIndex(id)]); 
      }
    }
    list.sort(function(a, b) {
      var aDate = new Date(entries[toIndex(a.id)].date);
      var bDate = new Date(entries[toIndex(b.id)].date);
      return bDate - aDate;
    });
    return fn(null, {
      entries: list,
      words: segs
    });
  };

  // category
  blog.category = {};

  blog.category.list = function(id, fn) {
    var valid = checkCategoryId(id);
    if (!valid) {
      return fn(new util.NotFound('Category id: ' + id));
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

  blog.category.getAll = function() {
    return categories;
  };

  // tag
  blog.tag = {};

  blog.tag.list = function(tag, fn) {
    if (!tags[tag]) {
      return fn(new util.NotFound('tag: ' + tag));
    }
    var list = [];
    for (var i = 0; i < tags[tag].length; i++) {
      list.push(entries[toIndex(tags[tag][i])]);
    }
    fn(null, {
      name: tag,
      entries: list
    });
  };

  blog.tag.getAll = function() {
    return tags;
  };

  // archives
  blog.archive = {};

  blog.archive.getAll = function(entry) {
     return calendar;
  };
  
  blog.archive.monthly = function(year, month, fn) {
    var valid = checkMonth(year, month);
    if (!valid) {
      return fn(new util.NotFound('Month: ' + year + '-' + month));
    }
    var list = [];
    for (var d in calendar[valid.year][valid.month]) {
      for (var i = 0; i < calendar[valid.year][valid.month][d].length; i++) {
        list.push(entries[toIndex(calendar[valid.year][valid.month][d][i])]);
      }
    }
    fn(null, {
      name: valid.year + '-' + valid.month,
      year: valid.year,
      month: valid.month,
      entries: list
    });
  };

  blog.archive.daily = function(year, month, date, fn) {
    var valid = checkDate(year, month, date);
    if (!valid) {
      return fn(new util.NotFound('Date: ' + year + '-' + month + '-' + date));
    }
    var list = [];
    for (var i = 0; i < calendar[valid.year][valid.month][valid.date].length; i++) {
      list.push(entries[toIndex(calendar[valid.year][valid.month][valid.date][i])]);
    }
    fn(null, {
      name: valid.year + '-' + valid.month + '-' + valid.date,
      year: valid.year,
      month: valid.month,
      entries: list
    });
  };

  blog.archive.calendar = function(year, month, fn) {
    var valid = checkCalendar(year, month);
    if (!valid) {
      return fn(new util.NotFound('Month: ' + year + '-' + month));
    }
    fn(null, valid.year, valid.month);
  };

  
  // comment
  blog.comment = {};

  blog.comment.recent = function() {
    var recent = [];
    var limit = LIMIT;
    for (var i = 0; i < limit; i++) {
      if (comments[i]) {
        if (toIndex(comments[i].id) == -1 || entries[toIndex(comments[i].id)].private) {
          limit++;
          continue;
        }
        recent.push(comments[i]);
      }
    }
    return recent;
  };

  // trackback
  blog.trackback = {};

  blog.trackback.recent = function() {
    var recent = [];
    var limit = LIMIT;
    for (var i = 0; i < limit; i++) {
      if (trackbacks[i]) {
        if (toIndex(comments[i].id) == -1 || entries[toIndex(trackbacks[i].id)].private) {
          limit++;
          continue;
        }
        recent.push(trackbacks[i]);
      }
    }
    return recent;
  };
  

  // Admin
  blog.entry.add = function(entry, fn) {
    var id = nextEntryId();
    var date = new Date().toString();
    var uuidString = uuid();
    entries.unshift({
      id: id,
      title: entry.title,
      date: util.toReadableDate(date),
      category: entry.category,
      tags: splitTag(entry.tags),
      comments: 0,
      trackbacks: 0,
      opening: util.makeOpening(entry.body),
      uuid: uuidString,
      private: entry.private
    });
    if (!entry.private) {
      categories[entry.category].entries.unshift(id);
    }         
    var stored = {
      id: id,
      title: entry.title,
      date: date,
      category: entry.category,
      tags: splitTag(entry.tags),
      body: entry.body,
      comments: [],
      trackbacks: [],
      trackback_to: entry.tb,
      uuid: uuidString,
      // update: null,
      private: entry.private
    };
    fs.writeFile(path.entry + id + '.json', JSON.stringify(stored, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null, stored);     
      addCalendar(stored);
      
      if (!entry.private) {
        published.unshift(id);
      }

      updateTags();
      
      // Update atom (async)
      generateAtom();            
      // Send trackback (aync)
      sendTrackback(entry.tb, stored);      
    });
  };

  // Admin
  blog.entry.edit = function(id, edit, fn) {
    var valid = checkEntryId(id);
    fs.readFile(path.entry + valid.id + '.json', 'UTF-8', function(err, data) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      var entry =  JSON.parse(data);
      var date = new Date().toString();
      var uuidString = uuid();
      
      // Delete by older category
      if (!entries[valid.index].private) {
        categories[entry.category].entries.splice(categories[entry.category].entries.indexOf(valid.id), 1);
      }
            
      entries[valid.index].title = entry.title = edit.title;
      entries[valid.index].category = entry.category = edit.category;
      entries[valid.index].tags = entry.tags = splitTag(edit.tags);
      entries[valid.index].body = entry.body = edit.body;
      // date is never update
      entry.update = date;
      var diffTb = edit.tb ? edit.tb.replace(entry.trackback_to, '') : '';
      entry.trackback_to = edit.tb;
      entries[valid.index].update = util.toReadableDate(date);
      entries[valid.index].opening = util.makeOpening(edit.body);
      entries[valid.index].uuid = entry.uuid = uuidString;  
      entries[valid.index].private = entry.private = edit.private;  

      if (!edit.private) {
        categories[edit.category].entries.unshift(valid.id);
      }
      categories[edit.category].entries.sort(function(a, b) {
        var aDate = new Date(entries[toIndex(a)].date);
        var bDate = new Date(entries[toIndex(b)].date);
        return bDate - aDate;
      });
      
      published = [];
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].private) {
          published.push(entries[i].id);
        }
      }

      updateTags();
      
      fs.writeFile(path.entry + valid.id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
        if (err) {
          return fn(new util.InternalServerError(err.message));
        }
        fn(null, entry);        
        // Atom
        generateAtom();            
        // Send trackback (aync)
        sendTrackback(diffTb, entry);
      });
    });
  };

  blog.entry.remove = function(id, fn) {
    var valid = checkEntryId(id);
    if (!valid) {
      return fn(new util.NotFound('Entry id: ' + id));
    }
    
    // Delete entry in categories
    categories[entries[valid.index].category].entries.splice(categories[entries[valid.index].category].entries.indexOf(valid.id), 1);
    // TODO: Async
    fs.writeFileSync(path.category, JSON.stringify(categories, null, '\t'), 'UTF-8'); 
    
    if (!entries[valid.index].private) {
      published.splice(published.indexOf(valid.id), 1);      
    }
        
    for (var i = 0; i < comments.length; i++) {
      if (comments[i].id == valid.id) {
        comments[i].private = true;
      }
    }
    for (var i = 0; i < trackbacks.length; i++) {
      if (trackbacks[i].id == valid.id) {
        trackbacks[i].private = true;
      }
    }
    updateTags();
    
    // Delete entry in calendar
    var date = new Date(entries[valid.index].date);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    calendar[y][m][d].splice(calendar[y][m][d].indexOf(valid.id), 1);
  
    var entry = entries[valid.index];
    entries.splice(valid.index, 1);
    fs.unlink(path.entry + valid.id + '.json', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null, entry);
      // Atom
      generateAtom();
    });
  };

  blog.category.add = function(name, fn) {
    if(!name) {
      return fn(new util.BadRequest('Invalid category name'));
    }
    var id = nextCategoryId();
    categories[id] = {
      name: name,
      entries: []
    };
    fs.writeFile(path.category, JSON.stringify(categories, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  blog.category.edit = function(category, fn) {
    if(!category.name) {
      return fn(new util.BadRequest('Invalid category name'));
    }
    var valid = checkCategoryId(category.id);
    if(!valid) {
        return fn(new util.NotFound('Category id: ' + category.id));
    }
   categories[valid.id].name = category.name;
    fs.writeFile(path.category, JSON.stringify(categories, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  blog.category.remove = function(id, fn) {
    var valid = checkCategoryId(id);
    if(!valid) {
        return fn(new util.NotFound('Category id: ' + category.id));
    }
    // Can't remove category 0
    if(valid.id == 0) {
      return fn(new util.BadRequest('Invalid category id'));
    }

    // Update entry's category to 0
    for (var i = 0; i < categories[valid.id].entries.length; i++) {
      var entryId = categories[valid.id].entries[i];
      var entry = JSON.parse(fs.readFileSync(path.entry + entryId + '.json'));
      entry.category = 0;
      fs.writeFileSync(path.entry + entryId + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8');
    }
    
    // update entries & categorys array
    categories[0].entries = [];
    for (i = 0; i < entries.length; i++) {
      if (entries[i].category == valid.id || entries[i].category == 0) {
        entries[i].category = 0;
        categories[0].entries.push(entries[i].id);
      }
    }
    delete categories[id];

    fs.writeFile(path.category, JSON.stringify(categories, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  // File
  blog.file = {};
  blog.file.list = function(fn) {
    var files = [];
    var tempFiles = fs.readdirSync(path.file);
    for (var i = 0; i < tempFiles.length; i++) {
      if (/^\.+/.test(tempFiles[i])) {
        continue;
      }
      var stat = fs.statSync(path.file + tempFiles[i]);
      files.push({
        name: tempFiles[i],
        date: stat.mtime,
        size: stat.size
      });
    }
    fn(null, { files: files });
  };

  blog.file.remove = function(name, fn) {
    fs.unlink(path.file + name, function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  blog.file.remove = function(name, fn) {
    fs.unlink(path.file + name, function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  blog.file.add = function(temp, filename, fn) {
    fs.rename(temp, path.file + filename, function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };

  blog.theme = {};
  blog.theme.edit = function(theme, fn) {
    if (!theme) {
      return fn(new util.BadRequest('Invalid theme id'));
    }
    conf.site.theme = theme;
    fs.writeFile(path.conf, JSON.stringify(conf, null, '\t'), 'UTF-8', function(err) {
      if (err) {
        return fn(new util.InternalServerError(err.message));
      }
      fn(null);
    });
  };
  
  blog.entry.getAll = function() {
    return entries;
  };

  return blog;

};