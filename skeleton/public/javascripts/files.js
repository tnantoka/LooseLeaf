$(function () {

  var $files = $('#files');
  var $table = $('#files table');
  var $tbody = $table.find('tbody');
  $table.tablesorter({ headers: { 3: { sorter: false } } });
  $files.modal({
    backdrop: true
  });

  // files
  $('#openFiles').click(function() {
    $files.modal('show');
    $files.activity();
    $.ajax({
      url: '/files',
      success: function(data) {
        $tbody.html('');
        var files = JSON.parse(data);
        for (var i = 0; i < files.length; i++) {
          $tbody.append(Renderer.file({ 
            file: files[i],
            disabled: user.id == files[i].user.id ? '' : ' disabled'
          })); 
        }
        $table.trigger('update');
        $files.activity(false);
      }
    });
    return false;
  });

  // Add by drag and drop
  //$table.bind('drop', function (e) {
  $files.bind('drop', function (e) {
    $(this).removeClass('dragover');
    $files.activity();

    var files = e.originalEvent.dataTransfer.files;

    var data = new FormData();

    /*
    for (var i = 0; i < files.length; i++) {
      data.append("files", files[i]);
    }
    */
    data.append("files", files[0]);

    $.ajax({
      url: '/files',
      type: 'POST',
      data: data,
      processData: false,
      contentType: false,
      success: function(data) {

        /*
        var file = JSON.parse(data); 
        $tbody.append(Renderer.file({ 
          file: file,
          disabled: ''
        })); 
        */

        $tbody.html('');
        var files = JSON.parse(data);
        for (var i = 0; i < files.length; i++) {
          $tbody.append(Renderer.file({ 
            file: files[i],
            disabled: user.id == files[i].user.id ? '' : ' disabled'
          })); 
        }

        $table.trigger('update');
        $files.activity(false);
      }
    });

    return false;
  })
  .bind("dragenter", function (e) {
    //$(this).addClass('dragover');
    return false;
  })
  .bind("dragover", function (e) {
    $(this).addClass('dragover');
    return false;
  })
  .bind("dragleave", function (e) {
    $(this).removeClass('dragover');
  });

  // Delete
  $table.find('form').live('submit', function (e) {
    if (confirm('Delete this file?')) {
      $files.activity();
      var $form = $(this); 
      $.ajax({
        type: $form.attr('method'),
        url: $form.attr('action'),
        data: $form.serialize(),
        success: function(data) {
          $form.parents('tr').remove();
          $files.activity(false);
        }
      });
    }
    return false;
  });


})

Renderer.file = (function() {

  var file = [
'        <tr>',
'          <td><a href="/files/<%= file.user.id + \'/\' + file.filename %>"><%= file.filename %></a></td>',
'          <td><a href="/users/<%= file.user.id %>"><%= file.user.username %></a></td>',
'          <td><%= file.ctime %></td>',
'          <td>',
'            <form action="/files/<%= file.filename %>" method="POST">',
'              <input type="hidden" name="_method" value="DELETE" />',
'              <button type="submit" method="POST" class="btn delete"<%= disabled %>><img src="/images/icons/delete.png" alt="delete" /></button>',
'            </form>',
'          </td>',
'        </tr>',
''
  ].join('\n');

  var ejs = require('ejs');
  return ejs.compile(file);

})();


