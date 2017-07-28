const keystone = require('keystone'),
	Image = keystone.list('Image'),
	Post = keystone.list('Post'),
	PostCount = keystone.list('PostCount');

const url = require('../../templates/views/helpers/url');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		post: null,		//current post for this page
		posts: [],		//for other latest posts
	};

	// Load the current post
	view.on('init', function (next) {

		var q = Post.model.findOne({
			state: 'published',
			slug: locals.filters.post,
		})
		.populate('image');

		q.exec(function (err, result) {
			if (err || !result) {
				return next(err);
			}

			//internal use for view, try not to use it in hbs
			locals.data.post = result;

			locals.data.title = result.Title;

			locals.data.meta = {
				title: locals.data.title,
				description: result.Description,
			};

			//subsitute images src
			result.forEachImages(
				function(image, imageDom) {
					imageDom.attr('src', url.imageUrl(image));
				},
			  function(err, html) {
					locals.data.html = html;
					next(err);
			  }
			);

		});

	});

	// Load other posts
	view.on('init', function (next) {

		var query = Post.model.find({'state': 'pulished'}).sort('-publishedDate').limit('4');

		query.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});

	//add post count
	view.on('init', function (next) {
		var post = locals.data.post;
		var query = PostCount.model.findOne({'post': post._id});

		query.exec(function(err, postCount) {
			if (err) {
				log.error("postCount query error", err);
				return next();
			}

			if (!postCount) {
				postCount = new PostCount.model({'post': post, 'count': 0})
			}

			postCount.count += 1;
			postCount.save(function(err, postCount) {
				next(err);
			});

		})
	});

	view.on('render', function (next) {
		if (locals.data.post.redirect) {
			res.redirect(locals.data.post.Reference);
		} else {
			next();
		}
	});

	// Render the view
	view.render('post');

};
