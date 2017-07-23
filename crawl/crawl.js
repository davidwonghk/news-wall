const yahoo = require('./yahoo');
const buzzbooklet = require('./buzzbooklet');
const how01 = require('./how01');

const keystone = require('keystone'),
    Post = keystone.list('Post'),
    PostTag = keystone.list('PostTag');

var log = require('logger')(__filename);




/**
 * origin: the origin to crawl
 * data: {tags, imageUrl, *}
 */
function _saveCrawl(origin, data, callback) {

		//find post by title
		Post.model.find().where('title', data.title).limit(1).exec(function(err, posts) {
			if (err) {callback(err); return;}
			if (posts.length > 0) {
				log.debug("skip recreate post", data.title);
				return callback();
			}

      Object.assign(data, {
				'state': 'published',
				'redirect': false,
      })
			var newPost = new Post.model(data);
			newPost.save(callback);
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
      _saveCrawl('yahoo', data, callback);
  	});
	});
},

crawlBuzzBooklet: function(num, callback) {
  buzzbooklet(num, function(err, data) {
		if (err) {callback(err); return;}
    _saveCrawl('buzzbooklet', data, callback);
  });
},

crawlHow01: function(num, callback) {
  how01(num, function(err, data) {
		if (err) {callback(err); return;}
    _saveCrawl('how01', data, callback);
  });
},

}
