const cheerio = require('cheerio');
const request = require('../util/request').get;

var log = require('logger')(__filename);



exports = module.exports = function (num, callback) {
	_findLatest(function(err, latest) {
		if (err) return callback(err);

		var next = function(err, data, link) {
			callback(err, data);
			if (!err && --num > 0) {
				_crawl(link, next);
			}
		};

		_crawl(latest, next);
	});
}


const source = 'www.bomb01.com';

//@param callback function(err, link)
function _findLatest(callback) {
	request('http://' + source, function(err, resp, html) {
		if (err) return callback(err);

		var $ = cheerio.load(html);
		var a = $('a');
		for (k in a) {
			var href = $(a[k]).attr('href');
			if (href && href.startsWith('/article/')) {
				return callback(null, href);
			}
		}
	});
}

//@param callback function(err, data, nextLink)
function _crawl(link, callback) {
	const url = _getArticleUrl(link);

	request(url, function(err, resp, html) {
		if (err) return callback(err);

		var $ = cheerio.load(html);
		var data = {
			'title': $('meta[property="og:title"]').attr('content'),
			'description': $('meta[property="og:description"]').attr('content'),
			'reference': url,
			'imageUrl': $('meta[property="og:image"]').attr('content'),
			'from': { 'site': source, 'link': url, 'author':$('div.user').text()},
		};

		//adjust image source
		var $content = $('div#content', 'div#article');
		$('img', $content).each(function(i, ele) {
			var $img = $(ele);
			var datasrc = $img.attr('data-src');
			$img.attr('data-src', '');
			$img.attr('src', 'http://'+source+datasrc);
		});
		data['content'] = {'html': $content.html() };

		var next = $('a.next_article').attr('href');
		next = next.substring(0, next.lastIndexOf('/'));
		callback(null, data, next);

	});
}

function _getArticleUrl(link) {
	return "http://"+source+link;
}
