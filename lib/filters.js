exports.login = function(req, res, next) {
  if (!req.session || !req.session.user) {
    // redirect('home');
    res.send(401);
  } else {
    next();
  } 
};

