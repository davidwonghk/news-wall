const keystone = require('keystone'),
	Image = keystone.list('Image');

const url = require('../../templates/views/helpers/url');
const Filter = require('../filter')

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var filter = Filter(req);

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
			if (err || !result) {
				return next(err);
			}

			//internal use for view, try not to use it in hbs
			locals.data.post = result;

			locals.data.title = filter.chinese(result.Title);

			locals.data.meta = {
				title: locals.data.title,
				description: filter.chinese(result.Description),
			};

			filter.chinese(result.Content, function(err, html) {
				locals.data.html = html
				next(err);
			});
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
			res.redirect(locals.data.post.Reference);
		} else {
			next();
		}
	});

	// Render the view
	view.render('post');

};
