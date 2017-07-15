var keystone = require('keystone'),
	PostCategory = keystone.list('PostCategory');

var url = require('../../templates/views/helpers/url');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	locals.filters = {
		category: req.query.c
	}

	locals.data = {
		categories: [],
	};

	view.on('init', function (next) {
		PostCategory.model.find()
			.sort('name')
			.exec(function (err, results) {
				locals.data.categories = results;
				next(err);
			});
	});


	view.on('render', function (next) {
		const  data_categories = locals.data.categories;

		if (!data_categories) {
			res.send([]);
			return;
		}

		var categories = data_categories.map(function(c) {
			var result = {
				"name": c.name,
				"url": url.categoryUrl(c.name),
			}
			if (locals.filters.category == c.name) {
				result.active = true;
			}
			return result;
		});

		res.send(categories);
	});

	view.render('categories');

}
