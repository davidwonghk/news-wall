var log = require('logger')(__filename);

function oneLine(obj) {
	if (!obj) return;
	return JSON.stringify(obj).replace(/\n/g, "");
}

exports = module.exports = function (req, res) {
	//for POST method only
	log.info('report', oneLine(req.body));

	req.flash('success', "檢舉成功");
	res.redirect('/post/' + req.body.post);
}
