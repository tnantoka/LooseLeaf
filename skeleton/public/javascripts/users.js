$(function () {

  var $main = $('#main');

  // Render users
  for (var i = 0; i < users.length; i++) {
    $main.append(Renderer.user({ 
      user: users[i],
      editable: typeof user != 'undefined' && (user.id == users[i].id || user.isAdmin) ? ' editable': '',
      action: '/users/' + users[i].id,
      method: 'PUT'
    }));
  }

  // Save
  $('.content .submit .save').live('click', function() {
    var $content = $(this).parents('.content'); 
    $content.activity();
    var $form = $content.find('.editForm'); 
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function(data){
        //$content.activity(false);
        var user = JSON.parse(data);
        $content.replaceWith(Renderer.user({ 
          user: user,
          editable: ' editable',
          action: '/users/' + user.id,
          method: 'PUT'
        }));
      }
    });
  });

  $('footer').activity(false);
});

Renderer.user = (function() {

  var user = [
'<div class="content<%= editable %>" data-user-id="<%= user.id %>" data-user-color="<%= user.color || \'\' %>" id="<%= user.username %>">',
'  <div class="show">',
'    <ul class="control action">',
'      <li><button type="button" class="btn edit"><img src="/images/icons/edit.png" alt="edit" /></button></li>',
'    </ul>',
'    <div class="page-header clearfix">',
'      <h1><a href="/users/<%= user.id %>"><%= user.fullname %></a></h1>',
'      <ul class="info">',
'        <li class="icon"><a href="/users/<%= user.id %>"><img src="<%= user.icon %>" alt="<%= user.username %>" /></a></li>',
'        <li><a href="/users/<%= user.username %>/posts"><%= user.posts %> posts</a></li>',
'      </ul>',
'    </div>',
'    <div class="row body">',
'      <div class="span14"><%- user.intro %></div>',
'    </div>',
'  </div>',
'  <form class="editForm" method="post" action="<%= action %>">',
'    <ul class="control submit">',
'      <li><button type="button" class="btn save">save</button></li>',
'      <li><button type="button" class="btn cancel">cancel</button></li>',
'    </ul>',
'    <div class="page-header clearfix">',
'      <h1><input type="text" name="user[fullname]" class="userFullname" placeholder="fullname" value="<%= user.fullname %>" required /></h1>',
'      <ul class="info">',
'        <li class="icon"><img src="<%= user.icon || \'/images/users/default.png\' %>" alt="<%= user.username %>" /></li>',
'        <li><input type="text" name="user[username]" class="userUsername" placeholder="username" value="<%= user.username %>" /></li>',
'        <li><input type="password" name="user[password]" class="userPassword" placeholder="password" /></li>',
'        <!--li><input type="text" name="user[color]" class="userColor" placeholder="color" value="<%= user.color %>" /></li-->',
'      </ul>',
'    </div>',
'    <div class="row">',
'      <div class="span14">',
'      <textarea name="user[intro]" class="userIntro"><%= user.intro %></textarea>',
'      </div>',
'    </div>',
'    <input type="hidden" name="_method" value="<%= method %>" >',
'    <input type="hidden" name="user[icon]" class="userIcon" value="<%= user.icon || \'/images/users/default.png\' %>" >',
'  </form>',
'</div>',
''
  ].join('\n');

  var ejs = require('ejs');
  return ejs.compile(user);

})();


// edit user
function edit($content) {
  if ($content.find('.cleditorMain').length == 0) {
    setIconEvent($content);

    var bodyHeight = $content.find('.body').height(); 
    var editor = $content.find('.userIntro').cleditor({
      height: bodyHeight
    })[0];
    editor.refresh(); // refresh for setting width

  } else {
    $content.find('.editForm').show();
  }
  $content.find('.show').hide();
  $content.find('.editForm').show();
  //var scrollTop = $(window).scrollTop();
  $content.find('.userFullname').focus();
  //$(window).scrollTop(scrollTop);
}

function setIconEvent($content) {

  var elm = $content.find('.editForm .icon').get(0);

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
          $content.find('.editForm .icon img').attr('src', reader.result);
          $content.find('.userIcon').val(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      //console.log(e);
    }
  }, true);
}

