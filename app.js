/*
 * LooseLeaf: A blog engine on node.js & express
 * https://looseleafjs.org/
 * License: The MIT License
 */

var VERSION = 0.1;

// TODO: Tags
// TODO: Error page
// TODO: Log
// TODO: Validation

/* Require standard modules */
var fs = require('fs');

/* Configure your looseleaf */

var baseDir = process.argv[2].indexOf('basedir=') != -1 ? process.argv[2].replace('basedir=', '') : '.';
var noDeamon = (process.argv[3] || process.argv[2]) == 'nodeamon';

// File paths
var Path = {
	conf: baseDir + '/conf/',
	entries: baseDir + '/entries/',
	file: baseDir + '/public/file/'
};

// Load conf files
var Conf = {
	site: JSON.parse(fs.readFileSync(Path.conf + 'site.json', 'UTF-8')), 
	aside: JSON.parse(fs.readFileSync(Path.conf + 'aside.json', 'UTF-8')), 
	categories: JSON.parse(fs.readFileSync(Path.conf + 'categories.json', 'UTF-8')), 
	tags: JSON.parse(fs.readFileSync(Path.conf + 'tags.json', 'UTF-8'))
};

// Init Entries
var Entries = (function() {
	var entries = [];
	var i = 0;

	var files = fs.readdirSync(Path.entries);
	var jsonFiles = [];
	// Select only .json files
	for (i = 0; i < files.length; i++) {
		if (/^[0-9]+.json$/.test(files[i])) {
			jsonFiles.push(files[i]);
		}
	}

	// Init entries meta info
	for (i = 0; i < jsonFiles.length; i++) {
		var entry = JSON.parse(fs.readFileSync(Path.entries + jsonFiles[i]));
		entries.push({
			id: entry.id,
			title: entry.title,
			// TODO: toReadable when store file
			date: toReadableDate(entry.date),
			update: toReadableDate(entry.update),
			category: entry.category,
			tags: entry.tags,
			comments: entry.comments.length,
			trackbacks: entry.trackbacks.length,
			opening: makeOpening(entry.body)
		});
	}

	// Descending sort by date
	entries.sort(function(a, b) {
		var aDate = new Date(a.date);
		var bDate = new Date(b.date);
		return bDate - aDate;
	});
	
	// Get entries
	var get = function() {
		return entries;
	};
	
	// Get entry's index
	var getIndex = function(id) {
		for (var i = 0; i < entries.length; i++) {
			if (id == entries[i].id) {
				return i;
			}
		}
		return -1;
	};
	
	entries.getIndex = getIndex;
	
	return entries;
})();

// Init categories
for (var i in Conf.categories) {
	if (Conf.categories.hasOwnProperty(i)) {
		Conf.categories[i].entries = [];	
	}
}
for (var i = 0; i < Entries.length; i++) {
	Conf.categories[Entries[i].category].entries.push(Entries[i].id);
}

/* Require third-party modules */
if (Conf.site.useBundleLib) {
	require.paths.unshift(__dirname + '/lib/');
}
var express = require('express');
var form = require('connect-form');
var daemon = require('daemon');
// var segmenter = require('./lib/segmenter');
var atom = require('./lib/atom');

// Inline require
// var url = require('path');
// var http = require('http');

/* Global Functions */

// Set common property to locals
function initLocals(locals) {
	locals.poweredBy = "LooseLeaf " + VERSION;

	locals.siteName = Conf.site.siteName;
	locals.description = Conf.site.description;
	locals.copyright = Conf.site.copyright;

	locals.about = Conf.aside.about;
	locals.author = Conf.aside.author; 
	locals.links = Conf.aside.links;
	locals.globalNavi = Conf.aside.globalNavi;
	
	locals.categories = Conf.categories;
	locals.tags = Conf.tags;

	// Recent Entries
	var recent = [];
	for (var i = 0; i < Conf.site.recentEntries; i++) {
		if (Entries[i]) {
			recent.push(Entries[i]);
		}
	}
	locals.recent = recent;

	return locals;
}

// Make opening contents
function makeOpening(body) {
	// Remove tag
	body = body.replace(/<[^>]+?>/g, '');
	return body.slice(0, Conf.site.opening) + (body.length > Conf.site.opening ? Conf.site.continueSign : '');
}

// Make excerpt contents for TrackBack
function makeExcerpt(body) {
	// Remove tag
	body = body.replace(/<[^>]+?>/g, '');
	return body.slice(0, 254);
}

// Date to readable string
function toReadableDate(s) {
	
	if (!s) { 
		return;
	}
	
	var date = new Date(s);
	
	var year = date.getFullYear();
	var month = fillZero((date.getMonth() + 1), 2);
	var day = fillZero(date.getDate(), 2);
	var hours = fillZero(date.getHours(), 2);
	var minutes = fillZero(date.getMinutes(), 2);
	var seconds = fillZero(date.getSeconds(), 2);

	var offset = date.getTimezoneOffset();
	var offsetSign = offset > 0 ? '-' : '+';
	var offsetHours = fillZero(Math.floor(Math.abs(offset) / 60), 2);
	var offsetMinutes = fillZero(Math.abs(offset) % 60, 2);

	var dateString = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + offsetSign + offsetHours + ':' + offsetMinutes;

	return dateString;
}

// TODO: to Util class
// Fill zero for string
function fillZero(s, n) {
	var zero = '';
	for (var i = 0; i < n; i++) {
		zero += '0';
	} 
	return (zero + s).slice(-n);
}

/* Create express server and export for spark */
var app = module.exports = express.createServer(
	// For uploading files
	form({ keepExtensions: true })
);

/* Configuration app */
app.configure(function() {
	app.set('views', __dirname + '/views');	

	// Set templete engine
	app.set('view engine', Conf.site.viewEngine);

	app.use(express.bodyDecoder());
	app.use(express.methodOverride());

// session.regenerate() error occurs
//	app.use(app.router);

	app.use(express.staticProvider(baseDir + '/public'));

// For session support
	app.use(express.cookieDecoder());
	app.use(express.session({secret: 'looseleafjs'}));
});

// Default
app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// NODE_ENV=production node app.js
app.configure('production', function() {
	app.use(express.errorHandler()); 
	
//	app.error(function(err, req, res, next) {
//		res.send('error');
//	});
});

/* Set routes */

var Mapping = {
	// TODO: Redirect if no slash
	root: '/', 
	top: '/index/0/', 
	index: '/index/:offset/', 
	entry: '/entry/:id/', 
	entry2: '/entry2/:id/', 
	comment: '/entry/:id/comment/', 
	category: '/category/:id/', 
	trackback: '/trackback/:id/', 
	atom: '/atom',
	admin: {
		root: '/admin?', 
		login: '/admin/login/',
		logout: '/admin/logout/',
		index: '/admin/index/',
		ref: '/admin/login/?ref=' ,
		entry: {
			add: '/admin/entry/add/', 
			edit: '/admin/entry/edit/:id/', 
			list: '/admin/entry/list/', 
			remove: '/admin/entry/remove/:id/'
		}, 
		category: {
			add: '/admin/category/add/',
			list: '/admin/category/list/',
			edit: '/admin/category/edit/:id/',
			remove: '/admin/category/remove/:id/'
		},
		file: {
			add: '/admin/file/add/',
			list: '/admin/file/list/',
			confirm: '/admin/file/confirm/',
			remove: '/admin/file/remove/'
		}
	}
};

var View = {
	index: 'index', 
	entry: 'entry', 
	entry2: 'entry2', 

	admin: {
		login: 'admin/login',
		index: 'admin/index',
		layout: 'admin/layout.ejs', 
		entry: {
			form: 'admin/entryForm', 
			result: 'admin/entryResult', 
			list: 'admin/entryList', 
			confirm: 'admin/entryConfirm', 
			remove: 'admin/entryRemove' 
		},
		category: {
			list: 'admin/categoryList', 
			confirm: 'admin/categoryConfirm'
		},
		file: {
			list: 'admin/fileList', 
			confirm: 'admin/fileConfirm'
		}
	}
};

/* Routes for general */

// Index
app.get(Mapping.root, function(req, res) {
	res.redirect(Mapping.top);
});
app.get(Mapping.index, function(req, res) {
	var offset = req.params.offset;
	if ((isNaN(offset) || /^0[0-9]+$/.test(offset) || offset < 0 || offset >= Entries.length / Conf.site.indexEntries) && Entries.length !== 0) {
		res.redirect(Mapping.top);
	}
	else {
		offset = parseInt(offset, 10);
		var entries = [];
		var start = offset * Conf.site.indexEntries;
		for (var i = start; i < start + Conf.site.indexEntries; i++) {
			if (Entries[i]) {
				entries.push(Entries[i]);
			}
		}
		res.render(View.index, {
			locals: initLocals({
				pageTitle: 'Index', 
				entries: entries,
				prev: offset - 1 >= 0 ? offset - 1 : null,
				next: offset + 1 < Entries.length / Conf.site.indexEntries ? offset + 1 : null
			})
		});
	}
});

// Show entry
app.get(Mapping.entry, function(req, res) {
	var id = req.params.id;
	var index = Entries.getIndex(id);
	if (isNaN(id) || /^0[0-9]+$/.test(id) || index == -1) {
		res.redirect(Mapping.top);
	}
	else {
		id = parseInt(id, 10);
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.redirect(Mapping.top);
			}
			else {
				var entry = JSON.parse(data);
				
				entry.date = Entries[index].date;
				entry.update = Entries[index].update;
				
				res.render(View.entry, {
					locals: initLocals({
						pageTitle: entry.title,
						msg: '',
						entry: entry,
						tbUrl: Conf.site.href.replace(/\/$/,  Mapping.trackback.replace(':id', Entries[index].id)),
						entryUrl: Conf.site.href.replace(/\/$/,  Mapping.entry.replace(':id', Entries[index].id)),
						prev: index - 1 >= 0 ? Entries[index - 1] : null,
						next: index + 1 < Entries.length ? Entries[index + 1] : null
					})				
				});
			}
		});
	}
});

// Show entry2
app.get(Mapping.entry2, function(req, res) {
	var id = req.params.id;
	var index = Entries.getIndex(id);
	if (isNaN(id) || /^0[0-9]+$/.test(id) || index == -1) {
		res.redirect(Mapping.top);
	}
	else {
		id = parseInt(id, 10);
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.redirect(Mapping.top);
			}
			else {
				var entry = JSON.parse(data);
				
				entry.date = Entries[index].date;
				entry.update = Entries[index].update;
				
				res.render(View.entry2, {
					locals: initLocals({
						pageTitle: entry.title,
						msg: '',
						entry: entry,
						prev: index - 1 >= 0 ? Entries[index - 1] : null,
						next: index + 1 < Entries.length ? Entries[index + 1] : null
					})				
				});
			}
		});
	}
});

// Add Comment
app.post(Mapping.comment, function(req, res) {
	var id = req.params.id;
	var index = Entries.getIndex(id);

	var author = req.body.author;
	var email = req.body.email;
	var uri = req.body.uri;
	var body = req.body.body;
	var date = new Date().toString();

	if (isNaN(id) || /^0[0-9]+$/.test(id) || index == -1 || !author || !body) {
		res.redirect('back');	
	}
	else {
		Entries[index].comments += 1;
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.redirect('back');
			}
			else {
				var entry = JSON.parse(data);
				entry.comments.push({
					author: author,
					email: email,
					uri: uri,
					body: body, 
					date: date
				});
				fs.writeFile(Path.entries + id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
					if (err) {
						res.redirect('back');
					}
					else {
						res.redirect('back');
					}
				});
			}
		});
	}
});

// Show category archives
app.get(Mapping.category, function(req, res) {
	var id = req.params.id;
	if (isNaN(id) || /^0[0-9]+$/.test(id) || !Conf.categories[id]) {
		res.redirect(Mapping.top);
	}
	else {
		var entries = [];
		var categoryEntries = Conf.categories[id].entries;
		for (var i = 0; i < categoryEntries.length; i++) {
			entries.push(Entries[Entries.getIndex(categoryEntries[i])]);
		}
		res.render('category', {
			locals: initLocals({
				pageTitle: Conf.categories[id].name,
				entries: entries
			})
		});
	}
});

// TrackBack
app.post(Mapping.trackback, function(req, res) {
	var id = req.params.id;
	var index = Entries.getIndex(id);

	var title = req.body.title;
	var excerpt = req.body.excerpt;
	var url = req.body.url;
	var blog_name = req.body.blog_name;
	var date = new Date().toString();

	var ERROR_MSG = '<?xml version="1.0" encoding="UTF-8"?><response><error>1</error><message>TrackBack Error</message></response>';
	var SUCCESS = '<?xml version="1.0" encoding="UTF-8"?><response><error>0</error></response>';
	res.contentType('application/xml');

	if (isNaN(id) || /^0[0-9]+$/.test(id) || index == -1 || !title || !excerpt || !url || !blog_name) {
		res.send(ERROR_MSG);
	}
	else {
		Entries[index].trackbacks += 1;
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.send(ERROR_MSG);
			}
			else {
				var entry = JSON.parse(data);
				entry.trackbacks.push({
					title: title,
					excerpt: makeExcerpt(excerpt),
					url: url,
					blog_name: blog_name, 
					date: date
				});
				fs.writeFile(Path.entries + id + '.json', JSON.stringify(entry, null, '\t'), 'UTF-8', function(err) {
					if (err) {
						res.send(ERROR_MSG);
					}
					else {
						res.send(SUCCESS);
					}
				});
			}
		});
	}
});

/* Routes for alternate */

// Atom
app.get(Mapping.atom, function(req, res) {

	var obj = {};
	
	obj.title = Conf.site.siteName;
	obj.href = Conf.site.href;
	
	obj.author = {
		name: Conf.aside.author.name
	};
	
	// Recent Entries
	var recent = [];
	for (var i = 0; i < Conf.site.recentEntries; i++) {
		if (Entries[i]) {
			var entry = {};
			entry.title = Entries[i].title;
			entry.href = Conf.site.href.replace(/\/$/,  Mapping.entry.replace(':id', Entries[i].id));
			entry.updated =  Entries[i].date;
			entry.summary = Entries[i].opening;
			recent.push(entry);
		}
	}
	
	obj.entries = recent;
	
	res.contentType('application/atom+xml');
	res.send(atom.generate(obj));
});

/* Include external source file for admin */
// TODO: Build
eval(fs.readFileSync('admin.js', 'UTF-8'));
//require('admin')(app);

/* Only listen on $ node app.js */
if (!module.parent) {
// Set port by command line
//	app.listen(process.argv[2] || 3000);
// Set port by conf file
	app.listen(Conf.site.port || 3000);
	console.log('"' + Conf.site.siteName + '" server listening on port %d', app.address().port);
}

if (Conf.site.password == 'pass') {
	console.log('[warning] Your password is default! Please change immediately!!');
}

/* Daemon */
if (!noDeamon) {
	daemon.daemonize('logs/looseleaf.log', 'pids/looseleaf.pid', function (err, pid) {
		if (err) {
			console.log('Error starting daemon: ' + err);
		}
		console.log('Daemon started successfully with pid: ' + pid);
	});
}

