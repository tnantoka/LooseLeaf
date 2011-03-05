var rfc3339 = require('./rfc3339');
var uuid = require('./uuid');

module.exports.generate = function(obj) {

	var atom = ['<?xml version="1.0" encoding="utf-8" ?>', '<feed xmlns="http://www.w3.org/2005/Atom">'];
	
	atom.push('<title>' + obj.title + '</title>');
	atom.push('<link href="' + obj.href + '" />');
	atom.push('<updated>' + rfc3339.convert(new Date(obj.entries[0].updated)) + '</updated>');
	atom.push('<author><name>' + obj.author.name + '</name></author>');
	atom.push('<id>urn:uuid:' + uuid.generate() + '</id>');
	
	for (var i = 0; i < obj.entries.length; i++) {
		atom.push('<entry>');
		atom.push('<title>' + obj.entries[i].title + '</title>');
		atom.push('<link href="' + obj.entries[i].href + '" />');
		atom.push('<id>urn:uuid:' + obj.entries[i].uuid + '</id>');
		atom.push('<updated>' + rfc3339.convert(new Date(obj.entries[i].updated)) + '</updated>');
		atom.push('<summary>' + escapeHtml(obj.entries[i].summary) + '</summary>');
		atom.push('</entry>');
	}

	atom.push('</feed>');
	return atom.join('\n');
};

function escapeHtml(s) {
	s = s.replace(/&/g, '&amp;');
	s = s.replace(/</g, '&lt;');
	s = s.replace(/>/g, '&gt;');
	s = s.replace(/"/g, '&quot;');
	s = s.replace(/'/g, '&#39;');
	return s;
}