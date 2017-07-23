var keystone = require('keystone'),
	PostTag = keystone.list('PostTag');

var url = require('../../templates/views/helpers/url');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	locals.filters = {
		tag: req.query.tag
	}

	locals.data = {
		tags: [],
	};

	view.on('init', function (next) {
		PostTag.model.find()
			.sort('name')
			.exec(function (err, results) {
				locals.data.tags = results;
				next(err);
			});
	});


	view.on('render', function (next) {
		const data_tags = locals.data.tags;

		if (!data_tags) {
			res.send([]);
			return;
		}

		var tags = data_tags.map(function(tag) {
			var result = {
				"name": tag,
				"url": url.tagUrl(tag),
			}
			if (locals.filters.tag == tag) {
				result.active = true;
			}
			return result;
		});

		res.send(tags);
	});

	view.render('tags');

}
