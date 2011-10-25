function getRenderer() {

  var renderer = {};;

  var post = [
'<div class="content" data-post-id="<%= post.id %>">',
'  <div class="show">',
'    <div class="page-header clearfix">',
'      <h1><a href=""><%= post.title %></a></h1>',
'      <ul class="info">',
'        <li class="icon"><a href="/author/<%= post.user.username %>"><img src="<%= post.user.icon %>" alt="<%= post.user.username %>" /></a></li>',
'        <li class="timeago" title="<%= post.created_at %>"><%= $.timeago(post.created_at) %></li>',
'        <% if (post.is_private) { %>',
'        <li class="private"><span class="label warning">private</span></li>',
'        <% } %>',
'      </ul>',
'    </div>',
'    <div class="row">',
'      <div class="span10"><%- post.body %></div>',
'    </div>',
'  </div>',
'</div>',
''
  ].join('\n');

  var editPost = [
'  <form class="edit" method="post" action="<%= action %>">',
'    <div class="page-header clearfix">',
'      <h1><input type="text" name="post[title]" class="post_title" placeholder="title" value="<%= post.title %>" required /></h1>',
'      <ul class="info">',
'        <li class="icon"><img src="<%= post.user.icon %>" alt="<%= post.user.username %>" /></li>',
'        <li class="timeago" title="<%= post.created_at %>"><%= $.timeago(post.created_at) %></li>',
'        <li class="tag"><input type="text" name="post[tag]" class="post_tag" placeholder="tag1, tag2..." value="<%= post.tag %>" /></li>',
'      </ul>',
'    </div>',
'    <div class="row">',
'      <div class="span13">',
'      <textarea name="post[body]" class="post_body"><%= post.body %></textarea>',
'      </div>',
'    </div>',
'    <input type="hidden" name="_method" value="<%= method %>" >',
'    <input type="hidden" name="post[is_private]" value="true" >',
'  </form>',
''
  ].join('\n');

  var control = [
'<div class="control">',
'  <ul class="action">',
'    <li><button type="button" class="btn edit"><img src="/images/icons/edit.png" alt="edit" /></button></li>',
'    <li><button type="button" class="btn private"><img src="/images/icons/private.png" alt="private" /></button></li>',
'    <li><button type="button" class="btn delete">×</button></li>',
'  </ul>',
'  <ul class="submit">',
'    <li><button type="button" class="btn save">save</button></li>',
'    <li><button type="button" class="btn cancel">cancel</button></li>',
'  </ul>',
'</div>',
''
  ].join('\n');
  
  var user = {};

  user.edit = [
'  <form class="edit" method="post" action="<%= action %>">',
'    <div class="page-header clearfix">',
'      <p>',
'        <a href="/author/<%= user.username %>"><img src="<%= user.icon %>" alt="<%= user.username %>" /></a>',
'        <span><input type="text" name="user[fullname]" class="user_fullname" placeholder="fullname" value="<%= user.fullname %>" /></span>',
'      </p>',
'    </div>',
'    <div class="row">',
'      <textarea name="user[intro]" class="user_intro"><%= user.intro %></textarea>',
'    </div>',
'    <p>color</p>',
'    <p>password</p>',
'  </form>',
''
  ].join('\n');

  user.control = [
'<div class="control">',
'  <ul class="action">',
'    <li><button type="button" class="btn edit"><img src="/images/icons/edit.png" alt="edit" /></button></li>',
'    <li><button type="button" class="btn delete">×</button></li>',
'  </ul>',
'  <ul class="submit">',
'    <li><button type="button" class="btn save">save</button></li>',
'    <li><button type="button" class="btn cancel">cancel</button></li>',
'  </ul>',
'</div>',
''
  ].join('\n');
 
  var ejs = require('ejs');
  renderer.post = ejs.compile(post);
  renderer.editPost = ejs.compile(editPost);
  renderer.control = ejs.compile(control);
  renderer.user = {};
  renderer.user.control = ejs.compile(user.control);
  renderer.user.edit = ejs.compile(user.edit);

  return renderer;

}

