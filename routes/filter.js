var OpenCC = require('opencc');
var opencc = new OpenCC('t2s.json');

var async = require('async');
var cheerio = require('cheerio')  ;

module.exports = {

	chinese : function(text, options){

		var $ = cheerio.load(text);
		return opencc.convertSync(text);
	},

};
