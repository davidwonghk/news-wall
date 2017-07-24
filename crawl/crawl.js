const yahoo = require('./yahoo');
const buzzbooklet = require('./buzzbooklet');
const how01 = require('./how01');
const bomb01 = require('./bomb01');

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
		Post.model.findOne({'title': data.title}).exec(function(err, exist) {
			if (err) return callback(err);

			if (exist) {
				log.debug("skip recreate from " + origin+":", data.title);
				return callback();
			}

      log.info("crawl from "+origin+":", data.reference)
      Object.assign(data, {
				'state': 'published',
				'redirect': false,
      })
			var newPost = new Post.model(data);
			newPost.save(callback);
		});

}

//-------------------------------------------------------------------------------
//exports

exports = module.exports = {}

/**
 * callback: function(err)
 */
exports.crawlYahooStyle = function(callback) {
  var yahooTags = ['power-look', 'video', 'fashion', 'beauty', 'men', 'weddings', 'horoscope', 'red-carpet', 'popculture', 'exclusive'];
	yahooTags.forEach(function (tagName) {
    yahoo(tagName, tagName, function(err, data) {
			if (err) return callback(err);
      _saveCrawl('yahoo', data, callback);
  	});
	});
}

exports.crawlBuzzBooklet = function(num, callback) {
  buzzbooklet(num, function(err, data) {
		if (err) {callback(err); return;}
    _saveCrawl('buzzbooklet', data, callback);
  });
}

exports.crawlHow01 = function(num, callback) {
  how01(num, function(err, data) {
		if (err) {callback(err); return;}
    _saveCrawl('how01', data, callback);
  });
}

exports.crawlBomb01 = function(num, callback) {
  bomb01(num, function(err, data) {
		if (err) {callback(err); return;}
    _saveCrawl('bomb01', data, callback);
  });
}


/*
 * grep all post.tags to sync it to PostTag
 * @param callback function(err)
 */
exports.syncPostTags = function() {
  Post.model.find().distinct('tags', function(err, tags) {
    tags.forEach(function(tag) {
      PostTag.model.findOne({'name': tag}).exec(function(err, postTag) {
        if (err) return;
        if (postTag) return;

        postTag = new PostTag.model({'name': tag})
        postTag.save(function(err) {
          if (err) return;
          log.info('PostTag created ', tag);
        });
      });
    });
  });
}
