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

  // Get next entry when scroll bottom
  var nowLoading;
  var socket = io.connect('/posts');

  // Add post content
  var $footer = $('footer');
  function addPost(post) {
    if (!post) return;
    $footer.before(render.post({ post: post }));
  }

  for (var i = 0; i < posts.length; i++) {
    addPost(posts[i]);
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


