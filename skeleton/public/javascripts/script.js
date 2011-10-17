$(function () {

  // Show login form
  $('#loginLink a').click(function() {
    $('#loginLink').hide();
    $('#loginForm').fadeIn('fast', function() {
      setTimeout(function() {
        $('#user_username').focus();
      }, 300);
    });
    return false;
  });

  // Scroll to top clicked topbar
  $('.topbar').dblclick(function() {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  });

  // ejs
  var ejs = require('ejs');
  renderPost = ejs.compile(postElement);

  // Get next entry when scroll bottom
  var nowLoading;
  var socket = io.connect('/posts');

  // Add post content
  var $footer = $('footer');
  function addPost(post) {
    if (!post) return;
    $footer.before(renderPost({ post: post }));
  }

  socket.on('connect', function() {

    socket.on('next', function(post) {
      nowLoading = false;
      $footer.activity(false);
      addPost(post);
    }); 

    onBottom(function() {
      var offset = $('.page-header').length;
      console.log(offset);
      if (!nowLoading) {
        nowLoading = true;
        $footer.activity();
        socket.emit('next', { offset: offset }); 
      }   
    }); 

  }); 

  // syntax highlight
  //prettyPrint();
})

var postElement = (function() {
return [
'<div class="content">',
  '<div class="page-header">',
    '<h1><a href=""><%= post.title %></a> <small>Supporting text or <a href="#">tagline</a></small></h1>',
    '<div class="row">',
      '<div class="span1">author</div>',
      '<div class="span2" title="<%= post.created_at %>"><%= $.timeago(post.created_at) %></div>',
    '</div>',
  '</div>',
  '<div class="row">',
    '<div class="span10">',
      '<%= post.body %>',
    '</div>',
  '</div>',
'</div>',
''].join('\n');
})();


