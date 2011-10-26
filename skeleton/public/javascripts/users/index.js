$(function() {

  // Set user data
  var user = { 
    username: $('#loginLink .user').text(),
    icon: $('#loginLink img').attr('src'),
    is_admin: $('#loginLink .user').data('userIsAdmin'),
  };
  console.log(user);

  /* config cleidtor  */
  $.cleditor.defaultOptions.width = 788;

  // Get ejs renderer
  var renderer = getRenderer();

  // Show new post form
  function showNewUser() {
    var locals = {
      user: {
        id: '',
        fullname: '',
        username: '',
        icon: '',
        intro: '',
        color: '',
        posts: {
          length: 0
        }
      }
    };
    $('.content:eq(0)').before(renderer.user.show(locals));
    $('.content:eq(0)').mouseover();
    $('.content:eq(0) .control .action .edit').click();
  }
  $('#loginLink .btn').click(function() {
    showNewUser();
  }); 

  // Show edit controls when hover content
  $('.content').live('mouseover', function() {
    // only current user owner
    username = $(this).find('.icon img').attr('alt');
    if (username != user.username && !user.is_admin) return;

    if ($(this).find('.control').length == 0) {
      $(this).prepend(renderer.user.control({}));
    } else {
      $(this).find('.control').show();
    }
  }).live('mouseout', function() {
    $(this).find('.control').hide();
  });

  // edit user
  $('.content .control .action .edit').live('click', function() {
    var $content = $(this).parents('.content'); 
    if ($content.find('from.edit').length == 0) {
      var locals = {
        user: {
          id: $content.data('userId'),
          fullname: $content.find('h1 > a').html(),
          username: $content.find('.icon img').attr('alt'),
          icon: $content.find('.icon img').attr('src'),
          intro: $content.find('.span10').html(),
          color: $content.data('userColor'),
        }
      };
      locals.action =  '/users' + (locals.user.id ? '/' + locals.user.id : '');
      locals.method = locals.user.id ? 'PUT' : 'POST';
      $content.append(renderer.user.edit(locals));
      setDadEvent($content);

      // copy css from show to edit form
      //$content.find('.post_title').copyCSS($content.find('h1 > a'));
      //$content.find('.post_tag').copyCSS($content.find('.show .tag'));
      //$content.find('.post_body').copyCSS($content.find('.span10'));
  
      var bodyHeight = $content.find('.span10').height(); 
      //var bodyWidth = $content.find('.span10').width(); 
      // set cleditor for body textarea
      var editor = $content.find('textarea.user_intro').cleditor({
        //width: bodyWidth,
        height: bodyHeight
      })[0];
      editor.refresh(); // refresh for % specified width

      var scrollTop = $(window).scrollTop();
      $content.find('.user_fullname').focus();
      $(window).scrollTop(scrollTop);
    } else {
      $content.find('form.edit').show();
    }
    $content.find('.action').hide();
    $content.find('.submit').show();
    $content.find('.show').hide();
    $content.find('.user_fullname').focus();
  });

  // save user
  $('.content .control .submit .save').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.activity();
    var $form = $content.find('form.edit'); 
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function(data){
        //$content.activity(false);
        $content.replaceWith(data);        
      }
    });
  });

  // cancel user
  $('.content .control .submit .cancel').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.find('.action').show();
    $content.find('.submit').hide();
    $content.find('form.edit').get(0).reset();
    $content.find('form.edit').hide();
    $content.find('.show').show();
  });


  // scroll to user
  function scrollToUser() {
    var hash = location.hash;
    if (hash) {
      $('html, body').animate({ scrollTop: $(hash).offset().top - 65 }, 'fast');
    }
  }
  $(window).bind('hashchange', scrollToUser).trigger('hashchange');

});


function setDadEvent($content) {

  var elm = $content.find('.icon.edit').get(0);

  elm.addEventListener('dragover', function(e) {
//  e.stopPropagation();
    e.preventDefault(); 
    $(elm).addClass('dragover');
  }, true);

  elm.addEventListener('dragleave', function(e) {
    $(elm).removeClass('dragover');
  }, true);

  elm.addEventListener('drop', function(e) {
    $(elm).removeClass('dragover');
    
//  e.stopPropagation();
    e.preventDefault();
    
    var dt = e.dataTransfer;
    var files = dt.files;

    try {
      if (files.length > 0) {
        var file = files[0];
        var reader = new FileReader();
        reader.onloadend = function() {
          $content.find('.icon.edit img').attr('src', reader.result);
          $content.find('.user_icon').val(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.log(e);
    }
  }, true);
}

