var render = {};

(function() {

var post = [
'<div class="content">',
'  <div class="page-header">',
'    <h1><a href=""><%= post.title %></a> <small>Supporting text or <a href="#">tagline</a></small></h1>',
'    <div class="row">',
'      <div class="span1">author</div>',
'      <div class="span2" title="<%= post.created_at %>"><%= $.timeago(post.created_at) %></div>',
'    </div>',
'  </div>',
'  <div class="row">',
'    <div class="span10">',
'    <%= post.body %>',
'    </div>',
'  </div>',
'</div>',
''].join('\n');

var ejs = require('ejs');
render.post = ejs.compile(post);

})();


