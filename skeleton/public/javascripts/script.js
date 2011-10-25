$(function () {

  // Set user data
  var user = { 
    username: $('#loginLink .user').text(),
    icon: $('#loginLink img').attr('src')
  };

  /* config cleidtor  */
  $.cleditor.defaultOptions.width = 788;
  //$.cleditor.defaultOptions.height = '90%';

  //$.cleditor.defaultOptions.controls = "bold italic underline strikethrough subscript superscript | font size style | color highlight removeformat | bullets numbering | outdent indent | alignleft center alignright justify | undo redo | rule table image link unlink icon | cut copy paste pastetext | print source";
  //$.cleditor.defaultOptions.controls = "bold italic underline strikethrough subscript superscript | font size style | color highlight removeformat | bullets numbering | outdent indent | alignleft center alignright justify | undo redo | rule table image link unlink icon | cut copy paste pastetext";

  // Get ejs renderer
  var renderer = getRenderer();

  // Show new post form
  function showNewPost() {
    var locals = {
      post : {
        id: '',
        title: '',
        body: '',
        tag: '',
        created_at: new Date(), 
        user: user
      }
    };
    $('.content:eq(0)').before(renderer.post(locals));
    $('.content:eq(0)').mouseover();
    $('.content:eq(0) .control .action .edit').click();
  }
  $('#loginLink .btn').click(function() {
    showNewPost();
    //$(this).attr('disabled', true);
  //}).attr('disabled', false); 
  }); 

  // Search by specified words
  function search(keyword) {
    location.href = '/search/' + encodeURIComponent(keyword);
  }
  $('#searchForm').submit(function() {
    var keyword = $(this).find('.keyword').val();  
    if (keyword) {
      search(keyword);
    }
    return false; 
  });

  // Add post content to bottom
  var $container = $('body > .container');
  if ($container.length == 0) {
    $container = $('body > .container-fluid');
  }
  function addPost(post) {
    if (!post) {
      hasNext = false;
      return;
    }
    $container.append(post);
  }

  // Show edit controls when hover content
  /*
  function setEditEvent($content) {
    $content.mouseover(function() {
      if ($(this).find('.editControl').length == 0) {
        $(this).prepend(renderer.editControl);
      } else {
        $(this).find('.editControl').show();
      }
    }).mouseout(function() {
      $(this).find('.editControl').hide();
    });
  }
  $('.content').each(function() {
    setEditEvent($(this));
  });
  */
  // by jquery live
  $('.content').live('mouseover', function() {
    // only current post owner
    username = $(this).find('.icon img').attr('alt');
    if (username != user.username) return;

    if ($(this).find('.control').length == 0) {
      $(this).prepend(renderer.control);
    } else {
      $(this).find('.control').show();
    }
  }).live('mouseout', function() {
    $(this).find('.control').hide();
  });

  // edit post
  $('.content .control .action .edit').live('click', function() {
    var $content = $(this).parents('.content'); 
    if ($content.find('from.edit').length == 0) {
      var locals = {
        post : {
          id: $content.data('postId'),
          title: $content.find('h1 > a').html(),
          tag: $content.find('.tag').text(),
          body: $content.find('.span10').html(),
          created_at: new Date($content.find('.timeago').attr('title')), 
          user: user
        }
      };
      locals.action =  '/posts' + (locals.post.id ? '/' + locals.post.id : '');
      locals.method = locals.post.id ? 'PUT' : 'POST';
      $content.append(renderer.editPost(locals));

      // copy css from show to edit form
      //$content.find('.post_title').copyCSS($content.find('h1 > a'));
      //$content.find('.post_tag').copyCSS($content.find('.show .tag'));
      //$content.find('.post_body').copyCSS($content.find('.span10'));
  
      var bodyHeight = $content.find('.span10').height(); 
      //var bodyWidth = $content.find('.span10').width(); 
      // set cleditor for body textarea
      var editor = $content.find('textarea.post_body').cleditor({
        //width: bodyWidth,
        height: bodyHeight
      })[0];
      editor.refresh(); // refresh for % specified width

      var scrollTop = $(window).scrollTop();
      $content.find('.post_title').focus();
      $(window).scrollTop(scrollTop);
    } else {
      $content.find('form.edit').show();
    }
    $content.find('.action').hide();
    $content.find('.submit').show();
    $content.find('.show').hide();
    $content.find('.post_title').focus();
  });

  // set private to post
  $('.content .control .action .private').live('click', function() {
    var $content = $(this).parents('.content'); 
    var isPrivate = ($content.find('li.private').length > 0);
    if (confirm('Set private this post?')) {
      $.ajax({
        type: 'POST',
        url: '/posts/' + $content.data('postId'),
        data: '_method=PUT&post' + encodeURIComponent('[is_private]') + '=' + (isPrivate ? '' : true),
        cache: false,
        success: function(data) {
          //$content.activity(false);
          console.log(data);
          $content.replaceWith(data);        
        }
      });
    }
  });


  // delete post
  $('.content .control .action .delete').live('click', function() {
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

  // save post
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

  // cancel post
  $('.content .control .submit .cancel').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.find('.action').show();
    $content.find('.submit').hide();
    $content.find('form.edit').get(0).reset();
    $content.find('form.edit').hide();
    $content.find('.show').show();
  });

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

  // Show popover to scroll top below topbar
  $('.topbar').attr('title', '<a href="#" onclick="return scrollToTop();">Scroll<br />to Top</a>');
  $('.topbar').popover({
    //placement: 'below',
    placement: 'above',
    trigger: 'manual',
    html: true
  });
  $('.topbar').dblclick(scrollToTop);

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

  // Get next entry when scroll bottom with socket.io
  var hasNext = $('.page-header').length == 5 ? true : false;
  var nowLoading;
  var socket = io.connect('/posts');
  var $footer = $('footer');

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

