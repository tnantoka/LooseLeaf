$(function () {

  $main = $('#main');

  // Render posts
  for (var i = 0; i < posts.length; i++) {
    $main.append(Renderer.post(posts[i]));
  }

})


