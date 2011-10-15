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

  // Add post content
  var $footer = $('footer');
  function insertContent(post) {
    var content = generatePost(post);
    $footer.before(content);
  }

  // Scroll to top clicked topbar
  $('.topbar').dblclick(function() {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  });

  // Get next entry when scroll bottom
  var nowLoading;
  var socket = io.connect('/posts');

  socket.on('connect', function() {

    socket.on('next', function(post) {
      nowLoading = false;
      if (post) {
        var section = [ 
          '<section>',
            '<h1>', post.title, '</h1>',
            '<p>', new Date(post.date), '</p>',
            '<pre>', post.body, '</pre>',
          '</section>'].join('');
        document.body.innerHTML += section;
      }   
    }); 

    onBottom(function() {
      var offset = $('.page-header').length;
      console.log(offset);
      if (!nowLoading) {
        nowLoading = true;
        socket.emit('next', { offset: offset }); 
      }   
    }); 

  }); 

  // syntax highlight
  //prettyPrint();
})

