/* For admin */

// TODO: Remove sync API

/* Functions for admin */

// Check session
function isLogged(req) {
	return req.session && req.session.userId == Conf.site.userId
}

/*
// Analyze tags
function analyzeTags(body) {
	var segment = segmenter.segment(body);
	var tags = {};
	for (var i = 0; i < segment.length; i++) {
		tags[segment[i]] = tags[segment[i]] ? tags[segment[i]] + 1 : 1;
	} 
	return tags;
}
*/


/* Set routes for admin */

// Login
app.get(Mapping.admin.root, function(req, res) {
	res.redirect(Mapping.admin.login);
});
app.get(Mapping.admin.login, function(req, res) {
	if (isLogged(req)) {
		res.redirect(Mapping.admin.index);
	}
	else {
		res.render(View.admin.login, {
			locals: initLocals({
				pageTitle: 'Login',
				msg: '',
				ref: req.query.ref ? req.query.ref : null
			}), 
			layout: View.admin.layout
		});
	}
});
app.post(Mapping.admin.login, function(req, res) {
	var userId = req.body.userId;
	var password = req.body.password;
	if (userId == Conf.site.userId && password == Conf.site.password) {
		req.session.regenerate(function() {
			req.session.userId = userId;
			// Return to refferer page
			if (req.body.ref) {
				res.redirect(req.body.ref);
			}
			else {
				res.redirect(Mapping.admin.index);
			}
		});
	}
	else {
		res.render(View.admin.login, {
			locals: initLocals({
				pageTitle: 'Login',
				msg: 'Login failed. Please retry.', 
				ref: req.body.ref ? req.body.ref : null
			}), 
			layout: View.admin.layout
		});
	}
});

// Dashboard
app.get(Mapping.admin.index, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.login);
	}
	else {
		res.render(View.admin.index, {
			locals: initLocals({
				pageTitle: 'Dashboard',
			}), 
			layout: View.admin.layout
		});
	} 
});

// Logout
app.get(Mapping.admin.logout, function(req, res) {
	req.session.destroy(function() {
		res.redirect(Mapping.admin.login);
	});
});

// Post new entry
app.get(Mapping.admin.entry.new, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.new);
	}
	else {
		res.render(View.admin.entry.form, {
			locals: initLocals({
				pageTitle: 'Post New Entry',
				msg: '',
				action: Mapping.admin.entry.new,
				entry: {
					title: '',
					category: 0,
					body: ''
				}
			}), 
			layout: View.admin.layout
		});
	}
});
app.post(Mapping.admin.entry.new, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.new);
	}
	else {
		var title = req.body.title;
		var category = req.body.category;
		var body = req.body.body;
		if (!title || category == null || !body) {
			res.redirect('back');
		}
		else {
			if (Entries.length != 0) {
				var ids = [];
				for (var i = 0; i < Entries.length; i++) {
					ids.push(Entries[i].id);
				}
				var id = Math.max.apply(null, ids) + 1;
			}
			else {
				var id = 1;
			}
			var date = new Date().toString();
			Entries.unshift({
				id: id,
				title: title,
				date: toReadableDate(date),
				category: category,
				tags: [],
				comments: 0,
				trackbacks: 0,
				opening: makeOpening(body)
			});
			Conf.categories[category].entries.unshift(id);
			var entry = {
				id: id,
				title: title,
				date: date,
				category: category,
				tags: [],
				body: body,
				comments: [],
				trackbacks: []
			};
			fs.writeFile(Path.entries + id + '.json', JSON.stringify(entry, null, "\t"), 'UTF-8', function(err) {
				if (err) {
					res.redirect('back');
				}
				else {
					res.render(View.admin.entry.result, {
						locals: initLocals({
							pageTitle: 'Add New Entry',
							entry: entry,
							msg: '以下の内容で投稿しました。 '
						}), 
						layout: View.admin.layout
					});
				}
			});
		}
	} 
});

// List entry
// TODO: Pagenation
app.get(Mapping.admin.entry.list, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.list);
	}
	else {
		res.render(View.admin.entry.list, {
			locals: initLocals({
				pageTitle: 'Entry List',
				entries: Entries,
			}), 
			layout: View.admin.layout
		});
	} 
});

// Edit entry
app.get(Mapping.admin.entry.edit, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
	}
	else if (Entries.getIndex(id) == -1) {
		res.redirect(Mapping.admin.entry.list);		
	}
	else {
		fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
			if (err) {
				res.redirect('back');
			}
			var entry =  JSON.parse(data);
			res.render(View.admin.entry.form, {
				locals: initLocals({
					pageTitle: 'Edit Entry',
					msg: '',
					action: Mapping.admin.entry.edit.replace(':id', id),
					entry: entry
				}), 
				layout: View.admin.layout
			});
		});
	}
});
app.post(Mapping.admin.entry.edit, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.edit.replace(':id', id));
	}
	else if (Entries.getIndex(id) == -1) {
		res.redirect(Mapping.admin.entry.list);		
	}
	else {
		var title = req.body.title;
		var category = req.body.category;
		var tags = [];
		var body = req.body.body;
		if (!title || category == null || !body) {
			res.redirect('back');
		}
		else {
			fs.readFile(Path.entries + id + '.json', 'UTF-8', function(err, data) {
				if (err) {
					res.redirect('back');
				}
				else {
					var entry =  JSON.parse(data);
					var date = new Date().toString();
					// Delete by older category
					Conf.categories[entry.category].entries.splice
						(Conf.categories[entry.category].entries.indexOf(id), 1);
					
					var index = Entries.getIndex(id);
					Entries[index].title = entry.title = title;
					Entries[index].category = entry.category = category;
					Entries[index].tags = entry.tags = tags;
					Entries[index].body = entry.body = body;
// Date is never update
//					Entries[index].date = entry.date = date;
					entry.update = date;
					Entries[index].update = toReadableDate(entry.update);
					Entries[index].opening = makeOpening(body);

// Not change the sorting order of Entries
//					Entries.unshift(Entries[index]);
//					Entries.splice(index + 1, 1);
	
					Conf.categories[category].entries.unshift(id);

					fs.writeFile(Path.entries + id + '.json', JSON.stringify(entry, null, "\t"), 'UTF-8', function(err) {
						if (err) {
							res.redirect('back');
						}
						else {
							res.render(View.admin.entry.result, {
								locals: initLocals({
									pageTitle: 'Edit Entry',
									entry: entry, 
									msg: '以下の内容に修正しました。'
								}), 
								layout: View.admin.layout
							});
						}
					});
				}
			});
		}
	}
});

// Delete entry
app.get(Mapping.admin.entry.delete, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.delete.replace(':id', id));
	}
	else if (Entries.getIndex(id) == -1) {
		res.redirect(Mapping.admin.entry.list);		
	}
	else {
		var index = Entries.getIndex(id);
		res.render(View.admin.entry.confirm, {
			locals: initLocals({
				pageTitle: 'Delete Entry',
				entry: Entries[index]
			}), 
			layout: View.admin.layout
		});	
	}	
});
app.post(Mapping.admin.entry.delete, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.entry.delete.replace(':id', id));
	}
	else if (Entries.getIndex(id) == -1) {
		res.redirect(Mapping.admin.entry.list);		
	}
	else {
		var index = Entries.getIndex(id);
		
		// Delete by categories
		Conf.categories[Entries[index].category].entries.splice
			(Conf.categories[Entries[index].category].entries.indexOf(id), 1);

		var entry = Entries[index];
		Entries.splice(index, 1);
		fs.unlink(Path.entries + id + '.json', function(err) {
			if (err) {
				res.redirect('back');
			}
			else {
				res.render(View.admin.entry.delete, {
					locals: initLocals({
						pageTitle: 'Delete Entry', 
						entry: entry
					}), 
					layout: View.admin.layout
				});
			}
		});
	} 
});

// List categories
app.get(Mapping.admin.category.list, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
	}
	else {
		res.render(View.admin.category.list, {
			locals: initLocals({
				pageTitle: 'Category List',
				msg: ''
			}), 
			layout: View.admin.layout
		});
	} 
});

// Add new category
app.post(Mapping.admin.category.new, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
	}
	else {
		var name = req.body.name;
		if (!name) {
			res.redirect('back');
		} else {
			var ids = [];
			for (var i in Conf.categories) {
				ids.push(i);
			}
			var id = Math.max.apply(null, ids) + 1;
			Conf.categories[id] = {
				name: name,
				entries: []
			}
			fs.writeFile(Path.conf + 'categories.json', JSON.stringify(Conf.categories, null, "\t"), 'UTF-8', function(err) {
				if (err) {
					res.redirect('back');
				}
				else {
					res.redirect(Mapping.admin.category.list);			
				}
			});
		}
	}
});

// Edit category name
app.post(Mapping.admin.category.edit, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
	}
	else if (!Conf.categories[id]) {
		res.redirect(Mapping.admin.category.list);		
	}
	else {
		var name = req.body['name_' + id];
		Conf.categories[id].name = name;
		fs.writeFile(Path.conf + 'categories.json', JSON.stringify(Conf.categories, null, "\t"), 'UTF-8', function(err) {
			if (err) {
				res.redirect('back');
			}
			else {
				res.redirect(Mapping.admin.category.list);			
			}
		});
	} 
});

// Delete entry
app.get(Mapping.admin.category.delete, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
	}
	else if (!Conf.categories[id]) {
		res.redirect(Mapping.admin.category.list);		
	}
	else {
		// May not delete category id 0
		if (id == 0) {
			res.redirect('back');
		}
		res.render(View.admin.category.confirm, {
			locals: initLocals({
				pageTitle: 'Delete Category',
				id: id
			}), 
			layout: View.admin.layout
		});
	}
});
app.post(Mapping.admin.category.delete, function(req, res) {
	var id = req.params.id;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.category.list);
	}
	else if (!Conf.categories[id]) {
		res.redirect(Mapping.admin.category.list);		
	}
	else {
		var entries = Conf.categories[id].entries;
		for (var i = 0; i < entries.length; i++) {
			var entryId = entries[i];
			var entry = JSON.parse(fs.readFileSync(Path.entries + entryId + '.json', 'UTF-8'));
			entry.category = 0;
			fs.writeFileSync(Path.entries + entryId + '.json', JSON.stringify(entry, null, "\t"), 'UTF-8');
		}
		for (var i = 0; i < Entries.length; i++) {
			if (Entries[i].category = id) {
				Entries[i].category = 0;
			}
		}
		// TODO: Sort
		Conf.categories[0].entries = Conf.categories[id].entries.concat(Conf.categories[0].entries);
		delete Conf.categories[id];
	
		fs.writeFile(Path.conf + 'categories.json', JSON.stringify(Conf.categories, null, "\t"), 'UTF-8', function(err) {
			if (err) {
				res.redirect('back');
			}
			else {
				res.redirect(Mapping.admin.category.list);			
			}
		});
	}
});

// List files
app.get(Mapping.admin.file.list, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
	}
	else {
		var files = [];
		var tempFiles = fs.readdirSync(Path.file);
		for (var i = 0; i < tempFiles.length; i++) {
			if (/^\.+/.test(tempFiles[i])) {
				continue;
			}
			else {
				var stat = fs.statSync(Path.file + tempFiles[i]);
				files.push({
					name: tempFiles[i],
					date: stat.mtime,
					size: stat.size
				});
			}
		}
		res.render(View.admin.file.list, {
			locals: initLocals({
				pageTitle: 'File List', 
				msg: '',
				files: files
			}), 
			layout: View.admin.layout
		});
	} 
});

// Add new file
app.post(Mapping.admin.file.new, function(req, res) {
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
	}
	else {
		req.form.complete(function(err, fields, files) {
			if (err) {
				throw err;
			}
			else {
				fs.rename(files.file.path, Path.file + files.file.filename, function(err) {
					if (err) {
						res.redirect('back');				
					}
					else {
						res.redirect(Mapping.admin.file.list);				
					}
				});
			}
		});
	} 
});

// Delete file
app.post(Mapping.admin.file.confirm, function(req, res) {
	var name = req.body.name;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
	}
	else {
		res.render(View.admin.file.confirm, {
			locals: initLocals({
				pageTitle: 'Delete File', 
				name: name
			}), 
			layout: View.admin.layout
		});
	}
});
app.post(Mapping.admin.file.delete, function(req, res) {
	var name = req.body.name;
	if (!isLogged(req)) {
		res.redirect(Mapping.admin.ref + Mapping.admin.file.list);
	}
	else {
		fs.unlink(Path.file + name, function(err) {
			if (err) {
				res.redirect('back');
			}
			else {
				res.redirect(Mapping.admin.file.list);
			}
		});
	}
});

