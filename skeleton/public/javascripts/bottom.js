function onBottom(fn) {
  window.addEventListener('scroll', function() {
    var scrollTop  = document.body.scrollTop || document.documentElement.scrollTop;
    var scrollHeight = /*document.body.scrollHeight ||*/ document.documentElement.scrollHeight;
    var clientHeight = /*document.body.clientHeight ||*/ document.documentElement.clientHeight;

    var remain = scrollHeight - (clientHeight + scrollTop);

    if (remain == 0) {
      fn();
    }
  });
}
