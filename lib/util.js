/* Global functions */

var fs = require('fs'),
  http = require('http'),
  parse = require('url').parse,
  Deferred = require('./jsdeferred').Deferred;

// Export
exports.escapeHtml = escapeHtml;
exports.unescapeHtml = unescapeHtml;

exports.fillZero = fillZero;
exports.toReadableDate = toReadableDate;
exports.rfc3339 = rfc3339;

exports.makeOpening = makeOpening;
exports.makeExcerpt = makeExcerpt;

exports.NotFound = NotFound;
exports.InternalServerError = InternalServerError;
exports.BadRequest = BadRequest;

exports.readFile = readFile;
exports.writeFile = writeFile;

exports.POST = POST;
exports.GET = GET;

// Escape/Unscape HTML
function escapeHtml(s) {
  s = s.replace(/&/g, '&amp;');
  s = s.replace(/</g, '&lt;');
  s = s.replace(/>/g, '&gt;');
  s = s.replace(/"/g, '&quot;');
  s = s.replace(/'/g, '&#39;');
  return s;
}

function unescapeHtml(s) {
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&amp;/g, '&');
  return s;
}

// Fill zero for string
function fillZero(s, n) {
  var zero = '';
  for (var i = 0; i < n; i++) {
    zero += '0';
  } 
  return (zero + s).slice(-n);
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


// Make opening contents
function makeOpening(body) {
  // Remove tag
  body = body.replace(/<[^>]*?>/g, '');
  var limit = 100;
  return body.slice(0, limit) + (body.length > limit ? "..." : '');
}

// Make excerpt contents for TrackBack
function makeExcerpt(body) {
  // Remove tag
  body = body.replace(/<[^>]+?>/g, '');
  return body.slice(0, 254);
}

// 4XX Error
function NotFound(msg) {
  this.name = '404 NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

function BadRequest(msg) {
  this.name = '400 BadRequest';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
BadRequest.prototype.__proto__ = Error.prototype;

// 5XX Error
function InternalServerError(msg) {
  this.name = '500 InternalServerError';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
InternalServerError.prototype.__proto__ = Error.prototype;

// Deferred functions

function readFile(filename) {
  var deferred = new Deferred();
  fs.readFile(filename, 'UTF-8', function(err, data) {
    if (err) {
      deferred.fail(err);
    } else {
      deferred.call(data);
    }
  });
  return deferred;
}

function writeFile(filename, data) {
  var deferred = new Deferred();
  fs.writeFile(filename, data, 'UTF-8', function(err) {
    if (err) {
      deferred.fail(err);
    } else {
      deferred.call();
    }
  });
  return deferred;
}

function GET(url) {
  var deferred = new Deferred();
  var result = [];
  
  var url = parse(url);
  var options = {
    host: url.hostname,
    port: url.port || '80',
    path: url.pathname + (url.search || '') + (url.hash || ''),
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) { 
      result.push(chunk);
    });
    req.on('error', function (err) {
      deferred.fail(err);
    });
    res.on('end', function (chunk) { 
      deferred.call(result.join(''));
    });
  });
  req.end();

  return deferred;
}

function POST(url, body) {
  var deferred = new Deferred();
  var result = [];
  
  var url = parse(url);
  var options = {
    host: url.hostname,
    port: url.port || '80',
    path: url.pathname + (url.search || '') + (url.hash || ''),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) { 
      result.push(chunk);
    });
    req.on('error', function (err) {
      deferred.fail(err);
    });
    res.on('end', function (chunk) { 
      deferred.call(result.join(''));
    });
  });
  req.write(body);
  req.end();

  return deferred;
}
