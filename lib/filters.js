var persistence = require('./ext/persistencejs/lib/persistence').persistence;

exports.login = function(req, res, next) {
  if (!req.session || !req.session.user) {
    // redirect('home');
    res.send(401);
  } else {
    next();
  } 
};

exports.private = function(req, res, next) {
  if (!req.session || !req.session.user) {
    req.privateFilter = new persistence.PropertyFilter('is_private', '=', false);
  } else {
    req.privateFilter = new persistence.PropertyFilter('is_private', '>=', 0);
  } 
  next();
}

