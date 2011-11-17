/* config cleidtor  */
$.cleditor.defaultOptions.width = '858';

$(function () {

  var $main = $('#main');

  // Show login form
  $('#loginButton').click(function() {
    $('#loginLink').hide();
    $('#loginForm').fadeIn('fast', function() {
      setTimeout(function() {
        $('#username').focus();
      }, 300);
    });
    return false;
  });

  // Show new post form
  $('#newpost').click(function() {
    $('#main').prepend(Renderer.post({
      post: {
        id: '',
        title: '',
        body: '',
        tag: '',
        alias: '',
        createdAt: new Date(), 
        user: user
      },
      action: '/posts',
      method: 'POST',
      editable: ' editable',
      isFeedbacks: typeof isFeedbacks != 'undefined' ? true : false
    }));
    edit($('#main').find('.content:eq(0)'));
    $('#main').find('.content:eq(0) .submit .cancel').attr('disabled', true);
    return false;
  });

   // Show new user form
  $('#newuser').click(function() {
    $('#main').prepend(Renderer.user({
      user: {
        id: '',
        fullname: '',
        username: '',
        icon: '',
        intro: '',
        color: '',
        posts: 0,
        createdAt: new Date(), 
        user: user
      },
      action: '/users',
      method: 'POST',
      editable: ' editable'
    }));
    edit($('#main').find('.content:eq(0)'));
    $('#main').find('.content:eq(0) .submit .cancel').attr('disabled', true);
    return false;
  });

  // Edit 
  $('.content .action .edit').live('click', function() {
    edit($(this).parents('.content')); 
  });

  // Cancel 
  $('.content .submit .cancel').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.find('.editForm').hide();
    $content.find('.editForm').get(0).reset();
    $content.find('.show').show();
  });

  // Search by specified words
  $('#searchForm').submit(function() {
    var keyword = $('#keyword').val();  
    if (keyword) {
      location.href = '/search/' + encodeURIComponent(keyword);
    }
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

  var $scrollToTop2 = $('#scrollToTop2');
  $scrollToTop2.click(scrollToTop);

  var isPopover;
  $(window).scroll(function() {
    if ($('#main .content:eq(1)').length == 0) return false;
    var popoverBorder = $('#main .content:eq(1)').offset().top - 100;
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    if (scrollTop > popoverBorder && !isPopover) {
      //$('.topbar').popover('show');
      $scrollToTop2.fadeIn('fast');
      //$scrollToTop2.show();
      isPopover = true;
    } else if (scrollTop <= popoverBorder) {
      //$('.topbar').popover('hide');
      $scrollToTop2.fadeOut('fast');
      //$scrollToTop2.hide();
      isPopover = false;
    }
  });

  // Users navigation


  // syntax highlight
  prettyPrint();
})

function tag(tags) {
  tags = tags.split(/,\s*/);
  var html = [];
  tags.forEach(function(tag) {
    html.push('<a href="/tag/' + encodeURIComponent(tag) + '">' + tag + '</a>');
  });
  return html.join(', ');
}

function onBottom(fn) {
  $(window).scroll(function() {
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    var scrollHeight = /*document.body.scrollHeight ||*/ document.documentElement.scrollHeight;
    var clientHeight = /*document.body.clientHeight ||*/ document.documentElement.clientHeight;

    var remain = scrollHeight - (clientHeight + scrollTop);

    //if (remain == 0) {
    if (remain <= 0) {
      fn();
    }
  });
}

// Scroll to top clicked topbar or clicked popover
function scrollToTop(e) {
  $('html, body').animate({ scrollTop: 0 }, 'fast');
  return false;
}

var Renderer = {};


