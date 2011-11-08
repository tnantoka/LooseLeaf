exports.copyObj = function(obj) {
  var newObj = {};
  for (var i in obj) {
    newObj[i] = obj[i];
  }
  return newObj;
}

