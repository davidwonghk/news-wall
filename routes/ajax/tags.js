const keystone = require('keystone'),
	PostTag = keystone.list('PostTag');

const url = require('../../templates/views/helpers/url');
const Filter = require('../filter')


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var filter = Filter(req);

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
				"key": tag.name,
				"name": filter.chinese(tag.name),
				"url": url.tagUrl(tag.name),
			}
			return result;
		});

		res.send(payload);
	});

	view.render('tags');

}
