var async = require('async');
var keystone = require('keystone'),
	Image = keystone.list('Image');
var cheerio = require('cheerio')  ;
var url = require('../../templates/views/helpers/url')();

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		posts: [],
	};

	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('Post').model.findOne({
			state: 'published',
			slug: locals.filters.post,
		})
		.populate('categories image');

		q.exec(function (err, result) {
			if (err) {next(err); return;}

			locals.data.post = result;
			locals.data.meta = {
				title: result.title,
				description: result.Description
			};

			//subsitute images src
	    var $ = cheerio.load(result.Content);
		  async.reduce($('img'), $, function(s, item, cb) {
				var src = $(item).attr('src');
		    if (!src || !src.startsWith('/img/')) {
					cb(null, this[0]);
				}

				var imageId = src.substring(5);
				Image.model.findById(imageId).exec(function(err, image) {
					if (!err) {
						this[1].attr('src', url.imageUrl(image));
						this[1].addClass('img-post');
					}
					cb(err, this[0]);
				}.bind([s, s(item)]) );

	  }, function(err, result) {
			locals.data.html = result.html()
			next(err);
	  });


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
