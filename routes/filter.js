const OpenCC = require('opencc');
const opencc = new OpenCC('t2s.json');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

function isChinese(c) {
	/[\u3400-\u9FBF]/.test(c);
}

module.exports = {

	chinese: function(text, callback) {
		text = entities.decode(text);
		if (callback) {
			opencc.convert(text, callback);
		} else {
			return opencc.convertSync(text);
		}
	},

};
