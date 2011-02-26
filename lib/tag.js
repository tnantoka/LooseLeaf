/* Tag */

var fs = require('fs'),
	join = require('path').join,
	util = require('./util');

exports.init = function(siteDir, entry) {

	var that = {};

	var conf = require('./conf').get(siteDir);
	var PATH = join(siteDir, 'data/meta/tag.json');
	
	/* Init tags */
	var tags = JSON.parse(fs.readFileSync(PATH, 'UTF-8'));

	// Set entries
	for (var key in tags) {
		if (tags.hasOwnProperty(key)) {
			tags[key].entries = [];	
		}
	}
	var entries = entry.getAll();
	for (var i = 0; i < entries.length; i++) {
// TODO: Tag
//		tags[entries[i].tag].entries.push(entries[i].id);
	}
	
	/* Private methods */


	/* Public methods */
	
	// Get all tags
	that.getAll = function() {
		return tags;
	};
	
	return that;

};
