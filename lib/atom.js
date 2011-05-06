var util = require('./util');
var uuid = require('node-uuid');

module.exports.generate = function(obj) {

  var atom = ['<?xml version="1.0" encoding="utf-8" ?>', '<feed xmlns="http://www.w3.org/2005/Atom">'];
  
  atom.push('<title>' + obj.title + '</title>');
  atom.push('<link href="' + obj.href + '" />');
  atom.push('<updated>' + util.rfc3339(new Date(obj.entries[0].updated)) + '</updated>');
  atom.push('<author><name>' + obj.author.name + '</name></author>');
  atom.push('<id>urn:uuid:' + uuid() + '</id>');
  
  for (var i = 0; i < obj.entries.length; i++) {
    atom.push('<entry>');
    atom.push('<title>' + util.escapeHtml(obj.entries[i].title) + '</title>');
    atom.push('<link href="' + obj.entries[i].href + '" />');
    atom.push('<id>urn:uuid:' + obj.entries[i].uuid + '</id>');
    atom.push('<updated>' + util.rfc3339(new Date(obj.entries[i].updated)) + '</updated>');
    atom.push('<summary>' + util.escapeHtml(obj.entries[i].summary) + '</summary>');
    atom.push('</entry>');
  }

  atom.push('</feed>');
  return atom.join('\n');
};
