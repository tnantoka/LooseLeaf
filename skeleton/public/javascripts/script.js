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

/*
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    
    $('.page-header').not('.fix').each(function(i) {
      var top = $(this).position().top - 60;
      var bottom = top + 100;
      console.log('min, max, top;' + top + ',' + bottom + ',' + scrollTop);
      //if(min < top && top < max) {
       // console.log('fix:' + i);
      //}
    });

  var headers = [];
  $('.page-header')..each(function() {
    headers.push($(this).position().top - 60);
      console.log('min, max, top;' + top + ',' + bottom + ',' + scrollTop);
      //if(min < top && top < max) {
       // console.log('fix:' + i);
      //}
    });


  // Fix page title
  $(window).scroll(function() {
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    
    $('.page-header').not('.fix').each(function(i) {
      var top = $(this).position().top;
      var bottom = top + 100;
      console.log('min, max, top;' + top + ',' + bottom + ',' + scrollTop);
      //if(min < top && top < max) {
       // console.log('fix:' + i);
      //}
    });
*/


  });


  // syntax highlight
  prettyPrint();
})

