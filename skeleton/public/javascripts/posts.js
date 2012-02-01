$(function () {

  var $main = $('#main');

  // Render posts
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    $main.append(Renderer.post({ 
      post: post,
      editable: typeof user != 'undefined' && (user.id == post.user.id || user.isAdmin) ? ' editable': '',
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
            //isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
            isFeedbacks: false
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
          //isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
          isFeedbacks: false
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
              editable: typeof user != 'undefined' && (user.id == post.user.id || user.isAdmin) ? ' editable': '',
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

  /*
   * Comments
   */
  if (!config.disqus_shortname && posts.length) {

  var $comments = $('.comments');
  var $lastComment = $comments.find('dt:last');

  for (var i = 0; i < posts[0].comments.length; i++) { 
    var comment = posts[0].comments[i];
    $lastComment.before(Renderer.comment({ 
      comment: comment,
      post: posts[0],
      editable: typeof user != 'undefined' && (user.id == post.user.id || user.isAdmin) ? ' editable': ''
    }));
  }

  /*
  $comments.find('dd').live('mouseover', function() {
    $(this).addClass('mouseover');
    $(this).prev('dt').addClass('mouseover');
  }).live('mouseout', function() {
    $(this).removeClass('mouseover');
    $(this).prev('dt').removeClass('mouseover');
  });
  */

  // Add comments
  $('#addCommentForm').submit(function() {
    $comments.activity();
    var $form = $(this);
    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function(data){
        var comment = JSON.parse(data);
        $lastComment.before(Renderer.comment({ 
          comment: comment,
          post: posts[0],
          editable: typeof user != 'undefined' && (user.id == post.user.id || user.isAdmin) ? 'editable': ''
        }));
        $comments.activity(false);
      }
    });
    return false;
  });

  // Delete comments
  $comments.find('form.control').live('submit', function (e) {
    var $form = $(this);
    if (confirm('Delete this comment?')) {
      $comments.activity();
      var $form = $(this); 
      $.ajax({
        type: $form.attr('method'),
        url: $form.attr('action'),
        data: $form.serialize(),
        success: function(data) {
          $form.parents('dd').prev('dt').remove();
          $form.parents('dd').remove();
          $comments.activity(false);
        }
      });
    }
    return false;
  });

  if (location.hash == '#comments') {
    $('li.comment a').click(function() {
      $('html, body').animate({ scrollTop: $('#comments').offset().top }, 'fast');
      return false;
    }).click();
  }

  }

  $('footer').activity(false);
});

Renderer.post = (function() {

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
'        <% if (!config.disqus_shortname) { %>',
'        <li class="comment"><a href="/posts/<%= post.id %>#comments"><%- post.comments ? post.comments.length : 0 %> comments</a></li>',
'        <% if (isFeedbacks) { %>',
'        <!-- http://twitter.com/goodies/tweetbutton -->',
'        <li class="social"><a href="https://twitter.com/share" class="twitter-share-button" data-count="horizontal">Tweet</a></li>',
'        <!-- http://developers.facebook.com/docs/reference/plugins/like/ -->',
'        <li class="social"><div class="fb-like" data-send="false" data-layout="button_count" data-width="150" data-show-faces="false"></div></li>',
'        <% } %>',
'        <% } %>',
'        <% if (post.isPrivate) { %>',
'        <li class="private"><span class="label warning">private</span></li>',
'        <% } %>',
'      </ul>',
'    </div>',
'    <div class="row body">',
'      <div class="span14"><%- post.body %></div>',
'      <% if (isFeedbacks) { %>',
'      <% if (config.disqus_shortname) { %>',
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
'      <% } else { %>',
'      <div class="comments" id="comments">',
'      <h2>Comments</h2>',
'      <dl>',
'        <dt>',
//'          <img src="/images/icons/comment.png" alt="face" />',
'          <img src="/images/users/default.png" alt="face" />',
'        </dt>',
'        <dd>',
'          <form action="/posts/<%= post.id %>/comments" method="post" id="addCommentForm">',
'            <div class="input-prepend">',
'              <span class="add-on">by</span>', 
'              <input type="text" name="comment[username]" class="medium" placeholder="name" required />',
'            </div>',
'            <p><textarea name="comment[body]" placeholder="comment" required ></textarea><input type="submit" class="btn"></p>',
'            <input type="hidden" name="comment[postId]" value="<%= post.id %>" />',
'          </form>',
'        </dd>',
'      </dl>',
'      </div>',
'      <% } %>',
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
'<% if (isFeedbacks) { %>',
'<!-- twitter -->',
'<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>',
'<div id="fb-root"></div>',
'<script>(function(d, s, id) {',
'var js, fjs = d.getElementsByTagName(s)[0];',
'if (d.getElementById(id)) {return;}',
'js = d.createElement(s); js.id = id;',
'js.src = "//connect.facebook.net/ja_JP/all.js#xfbml=1";',
'fjs.parentNode.insertBefore(js, fjs);',
'}(document, \'script\', \'facebook-jssdk\'));</script>',
'<% } %>',
''
  ].join('\n');

  var ejs = require('ejs');
  return ejs.compile(post);

})();


Renderer.comment = (function() {

  var comment = [
'        <dt>',
//'          <img src="/images/icons/comment.png" alt="face" />',
'          <img src="/images/users/default.png" alt="face" />',
'        </dt>',
'        <dd class="<%= editable %>">',
'          <p>',
'            <span class="commentUsername"><%= comment.username %></span>', 
'            <span class="commentCreatedAt" title="<%= comment.createdAt %>"><%= $.timeago(comment.createdAt) %></span>',
'          </p>',
'          <p><%= comment.body %></p>',
'          <form action="/posts/<%= post.id %>/comments/<%= comment.id %>" method="POST" class="control">',
'            <input type="hidden" name="_method" value="DELETE" />',
'            <button type="submit" method="POST" class="btn delete"><img src="/images/icons/delete.png" alt="delete" /></button>',
'          </form>',
'        </dd>',
''
  ].join('\n');

  var ejs = require('ejs');
  return ejs.compile(comment);

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

