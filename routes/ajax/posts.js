const keystone = require('keystone'),
	Post = keystone.list('Post'),
	PostCategory = keystone.list('PostCategory');

const async = require('async');

const url = require('../../templates/views/helpers/url');
const Filter = require('../filter')

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var filter = Filter(req);

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
		var q = Post.model.find({
			'state': 'published'
		}).sort('-publishedDate')
			.populate('categories image')
			.limit(8);	//8 posts per flush

		if(locals.filters.timestamp) {
			q.where('publishedDate').lt(locals.filters.timestamp);
		}

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.posts = results;
			res.setHeader('Content-Type', 'application/json');
			next(err);
		});
	});


	view.on('render', function (next) {
		const data_posts = locals.data.posts;

		if (!data_posts) {
			res.send([]);
			return;
		}

		var posts = data_posts.map(function(p) {
			result = {
				"title": filter.chinese(p.Title),
				"postUrl": url.postUrl(p.slug),
			};

			//only add necessray key-value to payload to reduce network traffic
			if (p.image) {
				result.imageUrl = url.imageUrl(p.image);
			}

			if (p.from) {
				result.from = p.from;
			}

			return result;
		});

		last_post = data_posts[data_posts.length - 1]
		last_time = last_post ? last_post.publishedDate.getTime() : null
		res.send({"last": last_time,"posts": posts});

	});

	view.render('posts');

}
