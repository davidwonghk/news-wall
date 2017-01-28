var keystone = require('keystone'),
	Post = keystone.list('Post'),
	PostCategory = keystone.list('PostCategory');
var async = require('async');
var url = require('../../templates/views/helpers/url')();

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.filters = {
		category: req.query.c,
		timestamp: req.params.timestamp,
	};
	locals.data = {
		posts: [],
	};


	// Load the current category filter
	view.on('init', function (next) {

		if (!locals.filters.category) {
			next();
			return;
		}

		PostCategory.model.findOne({ key: locals.filters.category }).exec(function (err, result) {
			locals.data.category = result;
			next(err);
		});
	});

	// Load the posts
	view.on('init', function (next) {
		res.setHeader('Content-Type', 'application/json');

		var q = Post.model.find({
			'state': 'published'
		});
		//.sort('-publishedDate')
		//	.populate('categories image')
		//	.limit(8);


		if(locals.filters.timestamp) {
			var dateBefore = new Date(locals.filters.timestamp);
			q.where('publishedDate').lt(dateBefore);
		}

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			console.log(results);
			locals.data.posts = results;
			next(err);
		});
	});


	view.on('render', function (next) {
		if (!locals.data.posts) {
			res.send([]);
			return;
		}

		var posts = locals.data.posts.map(function(p) {
			result = {
				"title": p.title,
				"postUrl": url.postUrl(p.slug),
			};

			if (p.image) {
				result.imageUrl = url.imageUrl(p.image);
			}

			if (p.from) {
				result.from = {"text": p.from};

				if (p.references[1]) {
					result.from.url = p.references[1];
				}
			}

			return result;
		});

		res.send(posts);

	});

	view.render('posts');

}
