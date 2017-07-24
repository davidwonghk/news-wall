const crawl = require('../../crawl/crawl');

var log = require('logger')(__filename);



exports = module.exports = function (req, res) {

	//var locals = res.locals;
	var action = req.params.action;

	if (action == 'tags') {
		crawl.syncPostTags();
	}

	res.send({action: action, success:true});

};	//exports
