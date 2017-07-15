const OpenCC = require('opencc');
const opencc = new OpenCC('t2s.json');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();


module.exports = function(req) {

return {
	chinese: function(text, callback) {
		//defualt is tranditional chinese
		var tc = (req.cookies['zh'] != 'sc')
		dtext = entities.decode(text);

		if (callback) {
			return tc ? callback(null, text) : opencc.convert(dtext, callback);
		} else {
			return tc ? text : opencc.convertSync(dtext);
		}
	},
}

};
