var uuid = require('node-uuid');

module.exports.generateAtom = function(obj) {

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
    atom.push('<updated>' + rfc3339(new Date(obj.entries[i].updated)) + '</updated>');
    atom.push('<summary>' + util.escapeHtml(obj.entries[i].summary) + '</summary>');
    atom.push('</entry>');
  }

  atom.push('</feed>');
  return atom.join('\n');
};

// Convert date object to rfc3339
function rfc3339(date) {

  var year = date.getFullYear();
  var month = fillZero((date.getMonth() + 1), 2);
  var day = fillZero(date.getDate(), 2);
  var hours = fillZero(date.getHours(), 2);
  var minutes = fillZero(date.getMinutes(), 2);
  var seconds = fillZero(date.getSeconds(), 2);

  var offset = date.getTimezoneOffset();
  var offsetSign = offset > 0 ? '-' : '+';
  var offsetHours = fillZero(Math.floor(Math.abs(offset) / 60), 2)
  var offsetMinutes = fillZero(Math.abs(offset) % 60, 2);

  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + offsetSign + offsetHours + ':' + offsetMinutes;
  
};

// Fill zero for number string
function fillZero(s, n) {
  var zero = '';
  for (var i = 0; i < n; i++) {
    zero += '0';
  } 
  return (zero + s).slice(-n);
}


