module.exports = function(models) {
  
  this.index = function(req, res, next) {
    res.send('test');
  }

  return this;

}.bind({});

