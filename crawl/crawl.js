const yahoo = require('./yahoo');
const buzzbooklet = require('./buzzbooklet');

const keystone = require('keystone'),
    Post = keystone.list('Post'),
    PostCategory = keystone.list('PostCategory');

var log = require('logger')(__filename);


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
					log.debug('category created', category);
				})
			}

			_result.push(category);
      //tail recustion
			_tagsToCategories(tags, _result, callback);
		});
}



/**
 * origin: the origin to crawl
 * data: {tags, imageUrl, *}
 */
function _crawl(origin, data, callback) {

		//find post by title
		Post.model.find().where('title', data.title).limit(1).exec(function(err, posts) {
			if (err) {callback(err); return;}
			if (posts.length > 0) {
				log.debug("skip recreate post", data.title);
				return callback();
			}

			_tagsToCategories(data.tags, [], function(err, categories) {
        data.categories = categories;
        delete data.tags;

        Object.assign(data, {
					'state': 'published',
					'redirect': false,
        })
				var newPost = new Post.model(data);
				newPost.save(callback);

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

crawlBuzzBooklet: function(num, callback) {
  buzzbooklet(num, function(err, data) {
		if (err) {callback(err); return;}
    _crawl('buzzbooklet', data, callback);
  });
},

}
