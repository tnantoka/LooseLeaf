/* Request handler */

var NUM = 5;

// Init handler
exports.init = function(siteDir) {

	var conf = require('./conf').get(siteDir);
	var VERSION = require('./package').version();

	var that = {};
	
	var entry = require('./entry').init(siteDir);
	var category = require('./category').init(siteDir, entry);
	var tag = require('./tag').init(siteDir, entry);
	
	// Setting common property to locals
	function setLocals(locals) {
		locals.site = conf.site;
		locals.copyright = conf.copyright;
		locals.globalNavi = conf.globalNavi;
		locals.sidebar = conf.sidebar;
		locals.version = VERSION;
		
		// Recent Entries
		locals.recent = entry.getList(0, NUM);
		
		locals.categories = category.getAll();
		locals.tags = tag.getAll();
		
		return locals;
	}

	/* Test */
	that.hello = function(req, res) {
		return {
			status: 'OK',
			locals: setLocals({
				pageTitle: 'Hello', 
			})
		};
	};
	
	/* Public */

	// Show entry list with offset
	that.index = function(req, res) {
		var list = entry.getList(req.params.offset, NUM);
		if (list) {
			list.pagetTitle = 'index';
			return {
				status: 'OK',
				locals: setLocals(list)
			};
		} else {
			return {
				status: 'NG'
			}
		}
	};

	// Show entry with id
	that.index = function(req, res) {
		var entry = entry.get(req.params.id);
		if (list) {
			return {
				status: 'OK',
				locals: setLocals({
					pageTitle: entry.title
				})
			};
		} else {
			return {
				status: 'NG'
			}
		}
	};
	
	
	/* Admin */
	
	return that;
};