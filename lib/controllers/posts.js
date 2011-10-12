module.exports = function(models) {
  
  this.index = function(req, res, next) {
    var offset = req.params.offset;

    models.post.findAll(5, 0, function(err, rows) {
      // 結果が0なら404
      // errなら500
      if (err) {
        return next(err);
      }
      res.render('posts/index', {
      });
    });
  };
 
  return this;

}.bind({});

