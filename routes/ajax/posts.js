var keystone = require('keystone');
var async = require('async');
var url = require('../../templates/views/helpers/url')();

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.filters = {
		category: req.params.category,
		timestamp: req.params.timestamp,
	};
	locals.data = {
		posts: [],
	};


	// Load the current category filter
	view.on('init', function (next) {

		if (!locals.filters.category) {
			next();
		}

		keystone.list('PostCategory').model.findOne({ key: locals.filters.category }).exec(function (err, result) {
			locals.data.category = result;
			next(err);
		});
	});

	// Load the posts
	view.on('init', function (next) {
		var q = keystone.list('Post').paginate({
			page: req.query.page || 1,
			perPage: 4,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('categories image');


		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.posts = results.results;
			res.setHeader('Content-Type', 'application/json');
			next(err);
		});
	});


	view.on('render', function (next) {

		var posts = locals.data.posts.map(function(p) {
			result = {
				"title": p.title,
				"postUrl": url.postUrl(p.slug),
				"imageUrl": url.imageUrl(p.image),
			};

			if (p.references[1]) {
				result.from = {"text": p.from, "url": p.references[1]}
			}

			return result;
		});

		res.send(posts);

	});

	view.render('posts');

}
