$(function() {

  if (!/^\/admin/.test(location.pathname)) {
    getCalendar(year, month);
  }

  if (/^\/entry/.test(location.pathname)) {
    $("#commentsForm").exValidation({
      rules: {
        'comment-author': 'chkrequired',
        'comment-email': 'chkrequired chkemail',
        'comment-uri': 'chkrequired chkurl',
        'comment-body': 'chkrequired'
      },
      errInsertPos: 'after',
      errPosition: 'fixed',
//      firstValidate: true,
      scrollToErr: false,
      errFocus: true
    });
  }

  if (/^\/admin\/login/.test(location.pathname)) {
    $('#userId').focus();
    $("form").exValidation({
      rules: {
        'userId': 'chkrequired chknochar',
        'password': 'chkrequired chknochar'
      },
      errInsertPos: 'after',
      errPosition: 'fixed',
//      firstValidate: true,
      scrollToErr: false,
      errFocus: true
    });
  }

  if (/^\/admin\/entry\/add/.test(location.pathname) || /^\/admin\/entry\/edit/.test(location.pathname)) {
    $("form").exValidation({
      rules: {
        'title': 'chkrequired',
        'body': 'chkrequired'
      },
      errInsertPos: 'after',
      errPosition: 'fixed',
//      firstValidate: true,
      scrollToErr: false,
      errFocus: true
    });
  }

  if (/^\/admin\/category\/list/.test(location.pathname)) {
    $("#addForm").exValidation({
      rules: {
        'name': 'chkrequired'
      },
      errInsertPos: 'after',
      errPosition: 'fixed',
//      firstValidate: true,
      scrollToErr: false,
      errFocus: true
    });
  }

  if (/^\/admin\/file\/list/.test(location.pathname)) {
    $("#addForm").exValidation({
      rules: {
        'file': 'chkrequired'
      },
      errInsertPos: 'after',
      errPosition: 'fixed',
//      firstValidate: true,
      scrollToErr: false,
      errFocus: true
    });
  }


});

function getCalendar(year, month) {
  $('table.calendar').activity();
  $.ajax({
    url: '/calendar/' + year + '/' + month + '/',
    success: function(data) {
      $('table.calendar').activity(false)
        .html(data);
    }
  });
}