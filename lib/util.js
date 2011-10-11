/* Global functions */

var fs = require('fs'),
  http = require('http'),
  parse = require('url').parse,
  Deferred = require('./ext/jsdeferred').Deferred;

// Export
exports.escapeHtml = escapeHtml;
exports.unescapeHtml = unescapeHtml;

exports.toReadableDate = toReadableDate;

exports.makeOpening = makeOpening;
exports.makeExcerpt = makeExcerpt;

exports.NotFound = NotFound;
exports.InternalServerError = InternalServerError;
exports.BadRequest = BadRequest;

exports.readFile = readFile;
exports.writeFile = writeFile;

exports.POST = POST;
exports.GET = GET;

exports.checkToken = checkToken;

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
  this.message = msg;
  Error.call(this, msg); // TODO: Doesn't work?
  Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
NotFound.prototype.name = '404 NotFound';

function BadRequest(msg) {
  this.message = msg;
  Error.call(this, msg); // TODO: Doesn't work?
  Error.captureStackTrace(this, arguments.callee);
}
BadRequest.prototype.__proto__ = Error.prototype;
BadRequest.prototype.name = '400 BadRequest';

// 5XX Error
function InternalServerError(msg) {
  this.message = msg;
  Error.call(this, msg); // TODO: Doesn't work?
  Error.captureStackTrace(this, arguments.callee);
}
InternalServerError.prototype.__proto__ = Error.prototype;
InternalServerError.prototype.name = '500 InternalServerError';

// Deferred functions

function readFile(filename) {
  var deferred = new Deferred();
  fs.readFile(filename, 'UTF-8', function(err, data) {
    if (err) {
      err.filename = filename;
      deferred.fail(err);
    } else {
      data.filename = filename;
      deferred.call(data);
    }
  });
  return deferred;
}

function writeFile(filename, data) {
  var deferred = new Deferred();
  fs.writeFile(filename, data, 'UTF-8', function(err) {
    if (err) {
      err.filename = filename;
      deferred.fail(err);
    } else {
      deferred.call({filename: filename});
    }
  });
  return deferred;
}

function GET(urlString) {
  var deferred = new Deferred();
  var result = [];
  
  var url = parse(urlString);
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
    res.on('end', function () {
      var r = result.join('');
      r.url = urlString;
      deferred.call(r);
    });
  });
  req.on('error', function (err) {
    err.url = urlString;
    deferred.fail(err);
  });
  req.end();

  return deferred;
}

function POST(urlString, body) {
  var deferred = new Deferred();
  var result = [];
  
  var url = parse(urlString);
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
    res.on('end', function () { 
      var r = result.join('');
      r.url = urlString;
      deferred.call(r);
    });
  });
  req.on('error', function (err) {
    err.url = urlString;
    deferred.fail(err);
  });
  req.write(body);
  req.end();

  return deferred;
}


function checkToken(req) {
  return req.session && req.session.id == req.body.token;
}


