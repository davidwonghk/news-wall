var keystone = require('keystone')
var crawl = require('../../crawl/crawl');


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.filters = {
		num: req.query.num,
		c: req.query.crawl,
	};

	locals.data = {
		num: 1,
		crawl: ['buzzbook'],
	};


	view.on('init', function (next) {
		if (locals.filters.num) {
			locals.data.num = locals.filters.num
		}

		if (locals.filters.c) {
			locals.data.crawl = locals.filters.c.split(',')
		}

		if (locals.data.crawl.indexOf('buzzbook') >= 0) {
			crawl.crawlBuzzBooklet(locals.data.num, function(err) {
				if (err) console.log(err);
			});
		}

		res.setHeader('Content-Type', 'application/json');
		next();

	});

	view.on('render', function (next) {
		//do not call next and send the respone directly
		res.send(locals.data)
	});

	view.render('crawl');

}
