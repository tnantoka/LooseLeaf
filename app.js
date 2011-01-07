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
var crypto = require('crypto');

/* Configure your looseleaf */

// File paths
var Path = {
	conf: 'conf/',
	entries: 'entries/',
	file: __dirname + '/public/file/'
};

// Load conf files
var Conf = {
	site: JSON.parse(fs.readFileSync(Path.conf + 'site.json', 'UTF-8')), 
	aside: JSON.parse(fs.readFileSync(Path.conf + 'aside.json', 'UTF-8')), 
	categories: JSON.parse(fs.readFileSync(Path.conf + 'categories.json', 'UTF-8')), 
	tags: JSON.parse(fs.readFileSync(Path.conf + 'tags.json', 'UTF-8'))
}

// Init Entries
var Entries = (function() {
	var entries = [];

	var files = fs.readdirSync(Path.entries);
	var jsonFiles = [];
	// Select only .json files
	for (var i = 0; i < files.length; i++) {
		if (/^[0-9]+.json$/.test(files[i])) {
			jsonFiles.push(files[i]);
		}
	}

	// Init entries meta info
	for (var i = 0; i < jsonFiles.length; i++) {
		var entry = JSON.parse(fs.readFileSync(Path.entries + jsonFiles[i]));
		entries.push({
			id: entry.id,
			title: entry.title,
			date: entry.date,
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
		return -1
	};
	
	entries.getIndex = getIndex;
	
	return entries;
})();

// Init categories
for (var i in Conf.categories) {
	Conf.categories[i].entries = [];	
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

/* Global Functions */

// Set common property to locals
function initLocals(locals) {
	locals.powerdBy = "LooseLeaf " + VERSION;

	locals.siteName = Conf.site.siteName;
	locals.description = Conf.site.description;
	locals.copyright = Conf.site.copyright;

	locals.about = Conf.aside.about,
	locals.author = Conf.aside.author, 
	locals.links = Conf.aside.links
	
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

	return locals
}

// Make opening contents
function makeOpening(body) {
	return body.slice(0, Conf.site.opening) + (body.length > Conf.site.opening ? Conf.site.continue : '');
}

/* Create express server and export for spark */
var app = module.exports = express.createServer(
	// For uploading files
	form({ keepExtensions: true })
);

/* No daemon mode for mac */
if (process.argv[2] == 'nodeamon') {
	daemon.run = function(log, pid, func) {
		func();
	};
}

/* Daemon */
daemon.run('logs/looseleaf.log', 'pids/looseleaf.pid', function (err, started) {

if (err) {
	console.log('Error starting daemon: ' + err);
	return;
}

/* Configuration app */
app.configure(function() {
	app.set('views', __dirname + '/views');	

	// Set templete engine
	app.set('view engine', Conf.site.viewEngine);

	app.use(express.bodyDecoder());
	app.use(express.methodOverride());

// session.regenerate() error occurs
//	app.use(app.router);

	app.use(express.staticProvider(__dirname + '/public'));

// For session support
	app.use(express.cookieDecoder());
	app.use(express.session());
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
	comment: '/entry/:id/comment/', 
	category: '/category/:id/', 
	admin: {
		root: '/admin?', 
		login: '/admin/login/',
		logout: '/admin/logout/',
		index: '/admin/index/',
		ref: '/admin/login/?ref=' ,
		entry: {
			new: '/admin/entry/new/', 
			edit: '/admin/entry/edit/:id/', 
			list: '/admin/entry/list/', 
			delete: '/admin/entry/delete/:id/', 
		}, 
		category: {
			new: '/admin/category/new/',
			list: '/admin/category/list/',
			edit: '/admin/category/edit/:id/',
			delete: '/admin/category/delete/:id/',
		},
		file: {
			new: '/admin/file/new/',
			list: '/admin/file/list/',
			confirm: '/admin/file/confirm/',
			delete: '/admin/file/delete/',
		}
	}
};

var View = {
	index: 'index', 
	entry: 'entry', 

	admin: {
		login: 'admin/login',
		index: 'admin/index',
		layout: 'admin/layout.ejs', 
		entry: {
			form: 'admin/entryForm', 
			result: 'admin/entryResult', 
			list: 'admin/entryList', 
			confirm: 'admin/entryConfirm', 
			delete: 'admin/entryDelete', 
		},
		category: {
			list: 'admin/categoryList', 
			confirm: 'admin/categoryConfirm', 
		},
		file: {
			list: 'admin/fileList', 
			confirm: 'admin/fileConfirm', 
		}
	}
};

// Index
app.get(Mapping.root, function(req, res) {
	res.redirect(Mapping.top);
});
app.get(Mapping.index, function(req, res) {
	var offset = req.params.offset;
	if ((isNaN(offset) || /^0[0-9]+$/.test(offset) || offset < 0 || offset >= Entries.length / Conf.site.indexEntries) && Entries.length != 0) {
		res.redirect(Mapping.top);
	}
	else {
		offset = parseInt(offset);
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
		id = parseInt(id);
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.redirect(Mapping.top);
			}
			else {
				var entry = JSON.parse(data);
				res.render(View.entry, {
					locals: initLocals({
						pageTitle: entry.title,
						msg: '',
						entry: entry,
						prev: index - 1 >= 0 ? Entries[index - 1] : null,
						next: index + 1 < Entries.length ? Entries[index + 1] : null,
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
				fs.writeFile(Path.entries + id + '.json', JSON.stringify(entry, null, "\t"), 'UTF-8', function(err) {
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
				entries: entries,
			})
		});
	}
});

/* Include external source file for admin */
// TODO: Build
eval(fs.readFileSync('admin.js', 'UTF-8'));

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
if (process.argv[2] != 'nodeamon') {
	console.log('Daemon started successfully');
}
});
