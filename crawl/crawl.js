var async = require('async');
var cheerio = require('cheerio')  ;
var yahoo = require('./yahoo');
var buzzbooklet = require('./buzzbooklet');

var keystone = require('keystone'),
    Post = keystone.list('Post'),
    PostCategory = keystone.list('PostCategory'),
    Image = keystone.list('Image');


function _tagsToCategories(tags, _result, callback) {
		if (!tags) { callback(null, _result); return; }

		var tag = tags.pop();
		if (!tag) { callback(null, _result); return; }

		PostCategory.model.findOne({'name': tag}).exec(function(err, postCategories){
			if (err) {callback(err); return;}

			var category;
			if (postCategories.length > 0) {
				category = postCategories[0];
			} else {
				category = new PostCategory.model({name:tag});
				category.save(function(err){
					if (err) callback(err);
					console.log('category ' + category + ' created');
				})
			}

			_result.push(category);
      //tail recustion
			_tagsToCategories(tags, _result, callback);
		});
}


/**
 * callback(url, image)
 */
function _urlToImage(url, callback) {
  var image = new Image.model({reference:url});
  image.save(function(err) {
    callback(null, this);
  }.bind(image));
}


function _extractImages(html, callback) {
  if (!html) {
    callback(null, null);
    return;
  }

  var $ = cheerio.load(html);
  async.reduce($('img'), $, function(s, item, cb) {
    var src = s(item).attr('src');
    if (!src) cb(null, this[0]);

    _urlToImage(src, function(err, image) {
      if (!err) {
        this[1].attr('src', "/img/" + image._id);
      }
      cb(err, this[0]);
    }.bind([s, s(item)]));
  }, function(err, result) {
    callback(err, result.html());
  });

}

/**
 * data: {tags, imageUrl, *}
 */
function _crawl(source, data, callback) {

		//find post by title
		Post.model.find().where('title', data.title).limit(1).exec(function(err, posts) {
			if (err) {callback(err); return;}
			if (posts.length > 0) {
				console.log("skip recreate post:" + data.title);
				return callback('skip');
			}

			_tagsToCategories(data.tags, [], function(err, categories) {
        data.categories = categories;
        delete data.tags;

				_urlToImage(data.imageUrl, function(err, image) {
					if (err) return callback(err);

          data.image = image;
          delete data.imageUrl;
          Object.assign(data, {
						'state': 'published',
						'redirect': false,
						'image': image,
          })

          _extractImages(data.content.html, function(err, html) {
  					if (err) return callback(err);

            if (html) {
              data.content.html = html;
            }

  					var newPost = new Post.model(data);
  					newPost.save(callback);
          });

				});
			});

		});

}


exports = module.exports = {

/**
 * callback: function(err)
 */
crawlYahooStyle: function(callback) {
  var yahooTags = ['power-look', 'video', 'fashion', 'beauty', 'men', 'weddings', 'horoscope', 'red-carpet', 'popculture', 'exclusive'];
	yahooTags.forEach(function (tagName) {
    yahoo(tagName, tagName, function(err, data) {
			if (err) return callback(err);
      _crawl('yahoo', data, callback);
  	});
	});
},

crawlBuzzBooklet: function(callback) {
  buzzbooklet(10, function(err, data) {
		if (err) {callback(err); return;}
    _crawl('buzzbooklet', data, callback);
  });
},

}
