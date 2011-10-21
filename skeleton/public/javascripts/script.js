$(function () {

  // Show login form
  $('#loginLink a.login').click(function() {
    $('#loginLink').hide();
    $('#loginForm').fadeIn('fast', function() {
      setTimeout(function() {
        $('#user_username').focus();
      }, 300);
    });
    return false;
  });

  // Show popover below topbar
  $('.topbar').attr('title', '<a href="#" onclick="return scrollToTop();">Scroll<br />to Top</a>');
  $('.topbar').popover({
    //placement: 'below',
    placement: 'above',
    trigger: 'manual',
    html: true
  });

  $('.topbar').dblclick(scrollToTop);

  // Add post content
  var $footer = $('footer');
  function addPost(post) {
    if (!post) {
      hasNext = false;
      return;
    }
    $footer.before(render.post({ post: post }));
    //$footer.before(post);
  }

  // Add initial post by clientside
  for (var i = 0; i < posts.length; i++) {
    addPost(posts[i]);
  }

  var isPopover;
  var popoverBorder = $('.content:eq(1)').offset().top - 100;
  $(window).scroll(function() {
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    if (scrollTop > popoverBorder && !isPopover) {
      $('.topbar').popover('show');
      isPopover = true;
    } else if (scrollTop <= popoverBorder) {
      $('.topbar').popover('hide');
      isPopover = false;
    }
  });

  // Get next entry when scroll bottom
  var hasNext = $('.page-header').length == 5 ? true : false;
  var nowLoading;
  var socket = io.connect('/posts');

  socket.on('connect', function() {

    socket.on('next', function(post) {
      nowLoading = false;
      $footer.activity(false);
      addPost(post);
    }); 

    onBottom(function() {
      if (hasNext) {
        var offset = $('.page-header').length;
        if (!nowLoading) {
          nowLoading = true;
          $footer.activity();
          socket.emit('next', { offset: offset }); 
        }   
      }   
    }); 

  }); 

  // syntax highlight
  prettyPrint();
})

// Scroll to top clicked topbar or clicked popover
function scrollToTop() {
  $('html, body').animate({ scrollTop: 0 }, 'fast');
  return false;
}

