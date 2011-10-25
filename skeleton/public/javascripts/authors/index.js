$(function() {

  // Set user data
  var user = { 
    username: $('#loginLink .user').text(),
    icon: $('#loginLink img').attr('src')
  };
  console.log(user);

  /* config cleidtor  */
  $.cleditor.defaultOptions.width = 348;

  // Get ejs renderer
  var renderer = getRenderer();

  // TODO: new user

  // Show edit controls when hover content
  $('.content').live('mouseover', function() {
    // only current user
    username = $(this).find('.page-header img').attr('alt');
    if (username != user.username) return;

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
          username: $content.find('.page-header img').attr('alt'),
          fullname: $content.find('.page-header span').text(),
          intro: $content.find('.span5').html(),
          icon: $content.find('.page-header img').attr('src'),
        }
      };
      locals.action =  '/users' + (locals.user.id ? '/' + locals.user.id : '');
      locals.method = locals.user.id ? 'PUT' : 'POST';
      $content.append(renderer.user.edit(locals));

      var bodyHeight = $content.find('.span5').height(); 
      var editor = $content.find('textarea.user_intro').cleditor({
        //width: bodyWidth,
        height: bodyHeight + 20
      })[0];
      editor.refresh(); // refresh for % specified width

      var scrollTop = $(window).scrollTop();
      $content.find('.user_username').focus();
      $(window).scrollTop(scrollTop);
    } else {
      $content.find('form.edit').show();
    }
    $content.find('.action').hide();
    $content.find('.submit').show();
    $content.find('.show').hide();
    $content.find('.user_username').focus();
  });






});

