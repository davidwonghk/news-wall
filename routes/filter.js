const OpenCC = require('opencc');
const opencc = new OpenCC('t2s.json');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();


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
		dtext = entities.decode(text);

		if (callback) {
			return tc ? callback(null, text) : opencc.convert(dtext, callback);
		} else {
			return tc ? text : opencc.convertSync(dtext);
		}
	},
}

};
