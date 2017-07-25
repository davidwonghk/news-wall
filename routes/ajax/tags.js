var keystone = require('keystone'),
	PostTag = keystone.list('PostTag');

var url = require('../../templates/views/helpers/url');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	locals.filters = {
		tag: req.query.tag
	}

	var tags = []

	view.on('init', function (next) {
		PostTag.model.find()
			.sort('-count')
			.exec(function (err, results) {
				tags = results;
				next(err);
			});
	});


	view.on('render', function (next) {
		if (!tags) {
			res.send([]);
			return;
		}

		var payload = tags.map(function(tag) {
			var result = {
				"name": tag.name,
				"url": url.tagUrl(tag.name),
			}
			return result;
		});

		res.send(payload);
	});

	view.render('tags');

}
