const OpenCC = require('opencc');
const t2s = new OpenCC('t2s.json');
const s2t = new OpenCC('s2t.json');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();



exports = module.exports = {
}

//callback: function(err, converted)
exports.toSimplified = function(text, callback) {
	text = entities.decode(text);
	t2s.convert(text, callback);
}

//callback: function(err, converted)
exports.toTranditional = function(text, callback) {
	text = entities.decode(text);
	s2t.convert(text, callback);
}

exports.toTranditionalSync = function(text) {
	text = entities.decode(text);
	return s2t.convertSync(text);
}
