const crawl = require('../../crawl/crawl');

var log = require('logger')(__filename);

exports = module.exports = function (req, res) {

	const operations = {
		'buzzbook': crawl.crawlBuzzBooklet,
		'bomb01': crawl.crawlBomb01,
		'how01': crawl.crawlHow01,
	};

	// Init locals
	var locals = res.locals;
	locals.data = {
		num: req.query.num ? parseInt(req.query.num) : 1,
		targets: req.query.c ? req.query.c.split(',') : Object.keys(operations),
	};


	for(var i in locals.data.targets) {
		var t = locals.data.targets[i];
		operations[t](locals.data.num, function(err) {
			if (err) log.error('crawl '+t+':', err);
		});
	}

	res.setHeader('Content-Type', 'application/json');
	res.send(locals.data)

}
