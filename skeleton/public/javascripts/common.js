$(function () {

  // Show login form
  $('#loginLink a.login').click(function() {
    $('#loginLink').hide();
    $('#loginForm').fadeIn('fast', function() {
      setTimeout(function() {
        $('#loginForm input:eq(0)').focus();
      }, 300);
    });
    return false;
  });

  // Show new post form
  function showNewPost() {
    var locals = {
      post: {
        id: '',
        title: '',
        body: '',
        tag: '',
        created_at: new Date(), 
        user: user
      },
      action: '/posts',
      method: 'post'
    };
    $('body > .container').prepend(Renderer.post(locals));
  }
  $('#loginLink .btn').click(showNewPost);

  // syntax highlight
  prettyPrint();
})


