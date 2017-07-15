var keystone = require('keystone'),
	Image = keystone.list('Image');

var url = require('../../templates/views/helpers/url');
var filter = require('../filter')

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

		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post,
		})
		.populate('categories image');

		q.exec(function (err, result) {
			if (err) return next(err);

			locals.data.post = result;
			locals.data.meta = {
				title: filter.chinese(result.Title),
				description: filter.chinese(result.Description),
			};

			locals.data.html = filter.chinese(result.Content);
			next();
			//subsitute images src
			/*
			result.forEachImages(
				function(image, imageDom) {
					imageDom.attr('src', url.imageUrl(image));
				},
			  function(err, globalDom) {
					locals.data.html = result.html
					next(err);
			  }
			);
			*/

		});

	});

	// Load other posts
	view.on('init', function (next) {

		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').limit('4');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});

	});

	view.on('render', function (next) {
		if (locals.data.post.redirect) {
			res.redirect(locals.data.post.reference);
		} else {
			next();
		}
	});

	// Render the view
	view.render('post');

};
