#!/usr/bin/env node

/* control app.js with forever(http://github.com/indexzero/forever) */

var exec = require('child_process').exec;

var dir = __dirname;
var app = '"' + dir + '/app.js"';

var date = dateString();
switch(process.argv[2]) {

  case 'start':
    var command = 'forever start -p ' + dir +
      ' -l logs/forever_' + date + '.log' +
      ' -o ' + dir + '/logs/out_' + date + '.log' +
      ' -e ' + dir + '/logs/err_' + date + '.log ' +
      app;
    console.log(command);
    exec(command, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    });
    break;

  case 'stop':
    var command = 'forever stop -p ' + dir + ' ' + app;
    console.log(command);
    exec(command, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      if(stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    });
    break;

  // delete all log & pid file
  case 'clear':
    var command = 'rm -f ' + dir + '/logs/* ' + dir + '/pids/*';
    console.log(command);
    exec(command, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      if(stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.error(stderr);
      }
    });
    break;
  // show help
  case 'help':
  case '-h':
  default:
    console.log('# Control app.js with forever');
    console.log('## usage');
    console.log('  npm install -g forever');
    console.log('  node ctrl.js <command>');
    console.log('## commands');
    console.log('  start: start app.js');
    console.log('  stop: stop app.js');
    console.log('  clear: delete logs/* pids/*');
    console.log('  help: show this message');
    break;
}

function fillZero(s, n) {
  var zero = '';
  for (var i = 0; i < n; i++) {
    zero += '0';
  }
  return (zero + s).slice(-n);
}

function dateString() {
  var date = new Date();

  var year = date.getFullYear();
  var month = fillZero((date.getMonth() + 1), 2);
  var day = fillZero(date.getDate(), 2);
  var hours = fillZero(date.getHours(), 2);
  var minutes = fillZero(date.getMinutes(), 2);
  var seconds = fillZero(date.getSeconds(), 2);

  return year + '' + month + '' + day + '' + hours + '' + minutes + '' + seconds;
}

