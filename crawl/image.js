const keystone = require('keystone'),
    Image = keystone.list('Image');

exports = module.exports = {

/**
 * not yet support relative path crawling
 * callback(err, image)
 */
urlToImage: function(url, callback) {
  var image = new Image.model({reference:url});
  image.save(function(err) {
    callback(err, image);
  });
},


};
