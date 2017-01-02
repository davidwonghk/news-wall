var crawlYahoo = require('./yahoo');

var keystone = require('keystone'),
    Post = keystone.list('Post'),
    PostCategory = keystone.list('PostCategory');



function _tagsToCategories(tags, _result, callback) {

		var tag = tags.pop();
		if (!tag) {
			callback(null, _result);
			return;
		}

		PostCategory.model.find().where('name', tag).limit(1).exec(function(err, postCategories){
			if (err) {callback(err); return;}

			var category;
			if (postCategories.length > 0) {
				category = postCategories[0];
			} else {
				category = new PostCategory.model({name:tag});
				category.save(function(err){
					console.log('category ' + category + ' created');
					if (err) callback(err);
				})
			}

			_result.push(category);
			_tagsToCategories(tags, _result, callback);
		});
}


var cloudinary = require('cloudinary');
function _urlToCloudinaryImage(url, callback) {

	cloudinary.uploader.upload(url, function(result) {
		if (result.error) { callback(result.error); return; }
		callback(null, result);
	});
}

/**
 * data: {title, tags, imageUrl, content}
 */
function _crawl(source, data, callback) {

		//find post by title
		Post.model.find().where('title', data.title).limit(1).exec(function(err, posts) {
			if (err) {callback(err); return;}
			if (posts.length > 0) {
				console.log("skip recreate post:" + data.title);
				return;
			}

			_tagsToCategories(data.tags, [], function(err, categories) {
				_urlToCloudinaryImage(data.imageUrl, function(err, image) {
					if (err) {callback(err); return;}
					var newPost = new Post.model({
				    title: data.title,
						state: 'published',
						redirect: false,
						image: image,
						categories: categories,
						content: data.content,
						source: source
					});

					newPost.save(callback);
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
    crawlYahoo(tagName, tagName, function(err, data) {
  		if (err) {callback(err); return;}
      _crawl('yahoo', data, callback);
  	});
	});
},

}
