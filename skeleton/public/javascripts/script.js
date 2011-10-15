$(function () {

  // Show login form
  $('#loginLink a').click(function() {
    $('#loginLink').hide();
    $('#loginForm').fadeIn('fast');
    return false;
  });

  prettyPrint();

})

