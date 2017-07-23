const chinese = require('../util/chinese');

module.exports = function(req) {

function isTC(cookies) {
		var locale = cookies['locale']
		if (!locale) return true	 //defualt is tranditional chinese

		locale = locale.toLowerCase();
		if (['zh-cn','zh-sg','zh'].indexOf(locale) > -1) return false

		return true
}

return {
	chinese: function(text, callback) {
		var tc = isTC(req.cookies);

		if (callback) {
			return tc ? callback(null, text) : chinese.toTranditional(text, callback);
		} else {
			return tc ? text : toTranditionalSync(text);
		}
	},
}

};
