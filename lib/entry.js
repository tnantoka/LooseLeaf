/* Entry */

var fs = require('fs'),
	join = require('path').join,
	util = require('./util');

exports.init = function(siteDir) {

	var that = {};

	var conf = require('./conf').get(siteDir);
	var PATH = join(siteDir, 'data/entry');
	
	/* Init entries */
	var entries = [];

	// List entry files
	var entryFiles = [];
	var files = fs.readdirSync(PATH);
	// Select only .json files
	for (i = 0; i < files.length; i++) {
		if (/^[0-9]+\.json$/.test(files[i])) {
			entryFiles.push(files[i]);
		}
	}

	// Load entry
	for (i = 0; i < entryFiles.length; i++) {
		var entry = JSON.parse(fs.readFileSync(join(PATH, entryFiles[i])));
		entries.push({
			id: entry.id,
			title: entry.title,
			// TODO: toReadable when store file
			date: util.toReadableDate(entry.date),
			update: util.toReadableDate(entry.update),
			category: entry.category,
			tags: entry.tags,
			comments: entry.comments.length,
			trackbacks: entry.trackbacks.length,
			opening: util.makeOpening(entry.body)
		});
	}

	// Sort entries by date (descending)
	entries.sort(function(a, b) {
		var aDate = new Date(a.date);
		var bDate = new Date(b.date);
		return bDate - aDate;
	});
	
	/* Private methods */

	// Get index of id
	function getIndex(id) {
		if (isNaN(id) || /^0.+$/.test(id) || parseInt(id, 10) >= entries.length) {
			return -1;
		}
		for (var i = 0; i < entries.length; i++) {
			if (id == entries[i].id) {
				return i;
			}
		}
	}
	
	/* Public methods */
	
	// Get entry with id
	that.get = function(id) {
		var index = getIndex(id);
		return entries[index] || null;
	};

	// Get entry list with offset
	that.getList = function(offset, num) {
		// Return empty array If length is 0
		if (entries.length !== 0 
			&& (
				isNaN(offset) 
				|| /^0.+/.test(offset) 
				|| offset < 0 
				|| offset >= (entries.length / num)
			)) {
			return null;
		}
		offset = parseInt(offset, 10);
		var start = offset * num;
		var list = [];
		for (var i = start; i < start + num; i++) {
			if (entries[i]) {
				list.push(entries[i]);
			}
		}
		return {
			offset: offset,
			entries: list,
			prev: offset - 1 >= 0 ? offset - 1 : null,
			next: offset + 1 < entries.length / num ? offset + 1 : null
		};
	};

	// Get all entries
	that.getAll = function() {
		return entries;
	};

	return that;

};
