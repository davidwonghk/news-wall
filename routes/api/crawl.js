const keystone = require('keystone')
const crawl = require('../../crawl/crawl');

var log = require('logger')(__filename);

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	const operations = {
		'buzzbook': crawl.crawlBuzzBooklet,
		'bomb01': crawl.crawlBomb01,
		'how01': crawl.crawlHow01,
	};

	// Init locals
	locals.data = {
		num: req.query.num ? parseInt(req.query.num) : 1,
		targets: req.query.c ? req.query.c : Object.keys(operations),
	};


	view.on('init', function (next) {
		for(var i in locals.data.targets) {
			var t = locals.data.targets[i];
			operations[t](locals.data.num, function(err) {
				if (err) log.error('crawl '+t+':', err);
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
