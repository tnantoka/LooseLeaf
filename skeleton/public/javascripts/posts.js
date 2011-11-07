$(function () {

  var $main = $('#main');

  // Render posts
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    $main.append(Renderer.post({ 
      post: post,
      editable: typeof user != 'undefined' && user.username == post.user.username ? ' editable': '',
      action: '/posts/' + post.id,
      method: 'PUT',
      isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
    }));
  }

  // Set private to post
  $('.content .action .private').live('click', function() {
    var $content = $(this).parents('.content'); 
    var isPrivate = ($content.find('li.private').length > 0);
    if (confirm('Set ' + (isPrivate ? 'public' : 'private' ) + ' this post?')) {
      $.ajax({
        type: 'POST',
        url: '/posts/' + $content.data('postId'),
        data: '_method=PUT&post' + encodeURIComponent('[isPrivate]') + '=' + (isPrivate ? false : true),
        cache: false,
        success: function(data) {
          //$content.activity(false);
          var post = JSON.parse(data);
          $content.replaceWith(Renderer.post({ 
            post: post,
            editable: ' editable',
            action: '/posts/' + post.id,
            method: 'PUT',
            isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
          }));
        }
      });
    }
  });

  // Delete post
  $('.content .action .delete').live('click', function() {
    var $content = $(this).parents('.content'); 
    if (confirm('Delete this post?')) {
      $.ajax({
        type: 'POST',
        url: '/posts/' + $content.data('postId'),
        data: '_method=DELETE',
        success: function(data) {
          //$content.activity(false);
          $content.remove();        
        }
      });
    }
  });

  // Save
  $('.content .submit .save').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.activity();
    var $form = $content.find('.editForm'); 
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function(data){
        //$content.activity(false);
        var post = JSON.parse(data);
        $content.replaceWith(Renderer.post({ 
          post: post,
          editable: ' editable',
          action: '/posts/' + post.id,
          method: 'put',
          isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
        }));
      }
    });
  });

  // Get next entry when scroll bottom with socket.io
  var hasNext = $main.find('.content').length == 5 ? true : false;
  var nowLoading;
  var $footer = $('footer');
  onBottom(function() {
    if (hasNext) {
      if (!nowLoading) {
        var offset = $main.find('.content').length;
        nowLoading = true;
        $footer.activity();
        $.ajax({
          type: 'GET',
          url: '/next/' + offset,
          success: function(data){
            $footer.activity(false);
            var post = JSON.parse(data);
            if (!post) {
              hasNext = false;
              return;
            }
            $main.append(Renderer.post({ 
              post: post,
              editable: typeof user != 'undefined' && user.username == post.user.username ? ' editable': '',
              action: '/posts/' + post.id,
              method: 'PUT',
              isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
            }));
            $footer.activity(false);
            nowLoading = false;
          }
        });
      }   
    }   
  }); 

});

var Renderer = (function() {

  var renderer = {};;

  var post = [
'<div class="content<%= editable %>" data-post-id="<%= post.id %>">',
'  <div class="show">',
'    <ul class="control action">',
'      <li><button type="button" class="btn edit"><img src="/images/icons/edit.png" alt="edit" /></button></li>',
'      <% if (post.isPrivate) { %>',
'      <li><button type="button" class="btn private"><img src="/images/icons/public.png" alt="public" /></button></li>',
'      <% } else { %>',
'      <li><button type="button" class="btn private"><img src="/images/icons/private.png" alt="private" /></button></li>',
'      <% } %>',
'      <li><button type="button" class="btn delete"><img src="/images/icons/delete.png" alt="delete" /></button></li>',
'    </ul>',
'    <div class="page-header clearfix">',
'      <h1><a href="/posts/<%= post.id %>"><%= post.title %></a></h1>',
'      <ul class="info">',
'        <li class="icon"><a href="/users/<%= post.userId %>"><img src="<%= post.user.icon %>" alt="<%= post.user.username %>" /></a></li>',
'        <li class="timeago" title="<%= post.createdAt %>"><%= $.timeago(post.createdAt) %></li>',
'        <li class="tag"><%- tag(post.tag) %></li>',
'        <% if (post.isPrivate) { %>',
'        <li class="private"><span class="label warning">private</span></li>',
'        <% } %>',
'      </ul>',
'    </div>',
'    <div class="row body">',
'      <div class="span14"><%- post.body %></div>',
'      <% if (isFeedbacks && config.disqus_shortname) { %>',
'      <div id="disqus_thread"></div>',
'      <script>',
'        var disqus_shortname = \'<%= config.disqus_shortname %>\';',
'        var disqus_identifier = \'/posts/<%= post.id %>\';',
'        //var disqus_developer = 1;',
'        (function() {',
'          var dsq = document.createElement(\'script\'); dsq.type = \'text/javascript\'; dsq.async = true;',
'          dsq.src = \'http://\' + disqus_shortname + \'.disqus.com/embed.js\';',
'          (document.getElementsByTagName(\'head\')[0] || document.getElementsByTagName(\'body\')[0]).appendChild(dsq);',
'        })();',
'      </script>',
'      <% } %>',
'    </div>',
'  </div>',
'  <form class="editForm" method="post" action="<%= action %>">',
'    <ul class="control submit">',
'      <li><button type="button" class="btn save">save</button></li>',
'      <li><button type="button" class="btn cancel">cancel</button></li>',
'    </ul>',
'    <div class="page-header clearfix">',
'      <h1><input type="text" name="post[title]" class="postTitle" placeholder="title" value="<%= post.title %>" /></h1>',
'      <ul class="info">',
'        <li class="icon"><img src="<%= post.user.icon %>" alt="<%= post.user.username %>" /></li>',
'        <li class="timeago" title="<%= post.createdAt %>"><%= $.timeago(post.createdAt) %></li>',
'        <li class="tag"><input type="text" name="post[tag]" class="postTag" placeholder="tag1, tag2..." value="<%= post.tag %>" /></li>',
'        <!--li class="alias"><input type="text" name="post[alias]" class="postAlias" placeholder="alias" value="<%= post.alias %>" /></li-->',
'      </ul>',
'    </div>',
'    <div class="row">',
'      <div class="span14">',
'      <textarea name="post[body]" class="postBody"><%= post.body %></textarea>',
'      </div>',
'    </div>',
'    <input type="hidden" name="_method" value="<%= method %>" >',
'    <input type="hidden" name="post[isPrivate]" value="<%= typeof post.isPrivate == \'undefined\' ? true : post.isPrivate %>" >',
'  </form>',
'</div>',
''
  ].join('\n');

  var ejs = require('ejs');
  renderer.post = ejs.compile(post);

  return renderer;

})();

// edit post
function edit($content) {
  if ($content.find('.cleditorMain').length == 0) {
    var bodyHeight = $content.find('.body').height(); 
    var editor = $content.find('.postBody').cleditor({
      height: bodyHeight
    })[0];
    editor.refresh(); // refresh for setting width

  } else {
    $content.find('.editForm').show();
  }
  $content.find('.show').hide();
  $content.find('.editForm').show();
  //var scrollTop = $(window).scrollTop();
  $content.find('.postTitle').focus();
  //$(window).scrollTop(scrollTop);
}

