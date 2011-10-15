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

  // syntax highlight
  //prettyPrint();
})

