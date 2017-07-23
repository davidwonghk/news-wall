const keystone = require('keystone')
const crawl = require('../../crawl/crawl');

var log = require('logger')(__filename);

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
		crawl: ['buzzbook', 'how01'],
	};


	view.on('init', function (next) {
		if (locals.filters.num) {
			//override default value
			locals.data.num = locals.filters.num
		}

		if (locals.filters.c) {
			locals.data.crawl = locals.filters.c.split(',')
		}

		const num = parseInt(locals.data.num);

		if (locals.data.crawl.indexOf('buzzbook') >= 0) {
			crawl.crawlBuzzBooklet(num, function(err) {
				if (err) log.error('crawl buzzbooklet:', err);
			});
		}

		if (locals.data.crawl.indexOf('how01') >= 0) {
			crawl.crawlHow01(num, function(err) {
				if (err) log.error('crawl how01:', err);
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
