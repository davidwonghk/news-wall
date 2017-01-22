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
			var imgs = $('img');
			if (!imgs || imgs.length==0) {
				next(err);
			}

		  imgs.each(function(i, elem) {
				var src = $(elem).attr('src');
				if (!src) return true;
				if (!src.startsWith('/img/')) return true;

				var imageId = src.substring(5);
				Image.model.findById(imageId).exec(function(err, image) {
					if (err) {next(err); return;}

					this[0].attr('src', url.imageUrl(image));
					if (this[1]) {
						locals.data.html = $.html();
						next();
					}
				}.bind([$(elem), i==imgs.length-1]) );


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
