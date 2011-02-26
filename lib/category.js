/* Category */

var fs = require('fs'),
	join = require('path').join,
	util = require('./util');

exports.init = function(siteDir, entry) {

	var that = {};

	var conf = require('./conf').get(siteDir);
	var PATH = join(siteDir, 'data/meta/category.json');
	
	/* Init categories */
	var categories = JSON.parse(fs.readFileSync(PATH, 'UTF-8'));

	// Set entries
	for (var key in categories) {
		if (categories.hasOwnProperty(key)) {
			categories[key].entries = [];	
		}
	}
	var entries = entry.getAll();
	for (var i = 0; i < entries.length; i++) {
		categories[entries[i].category].entries.push(entries[i].id);
	}
	
	/* Private methods */


	/* Public methods */
	// Get all categories
	that.getAll = function() {
		return categories;
	};
	

	return that;

};
