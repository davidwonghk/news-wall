const cheerio = require('cheerio')  ;
const url = require('url');
const striptags = require('striptags');
const request = require('./util').get;

var log = require('logger')(__filename);

/**
callback
    'title': title,
    'tags': [tag],
    'imageUrl': imageUrl,
    'link': link,
		'content': {html:html}
*/
exports = module.exports = function (num, callback) {

	const current = Date.now()/1000;
	crawlCard(num, current, function(err, data) {
    if(err) { callback(err); return; }

		crawlLink(data.reference, function(err, html) {
	    if(err) { callback(err); return; }
			data['content'] = {'html': html};

			log.info('crawl', data.reference);
			callback(null, data);
		});

	});
};



function crawlCard(num, timestamp, callback) {
	if (num <= 0) return;

	const url = getCardListUrl(timestamp);
	request(url, function(err, resp, body) {
		if (err) { callback(err); return; }

		var json = JSON.parse(body);

		for (k in json.new_card_list) {
			if (--num < 0) return;

			var card = json.new_card_list[k];
			var data = {
				'reference': getCardUrl(card['card_id'], card['uri_title']),
				'from': {'site': card['website'], 'author': card['user_name'], 'link': parseHtmlEnteties(card['url'])},
				'imageUrl': getImageUrl(card['image_path']),
				'title': card['title'],
			}

			callback(null, data);
		}

		crawlCard(num, json['build'], callback);
	});
}


function crawlLink(url, callback) {
  request(url, function(err, resp, html) {
    if (err) { callback(err); return; }

    var $ = cheerio.load(html);
		var dec = $('.article-info .dec');
		$('.adv-border-cover', dec).remove();

		var html = dec.html();
		callback(null, html);
	});

}


function getCardListUrl(timestamp) {
	return "http://www.buzzbooklet.com/home/ajax_new_card_list/"+timestamp+"/0"
}

function getCardUrl(id, title) {
	return "http://www.buzzbooklet.com/card/"+id+"/"+title;
}

function getImageUrl(filename) {
	return "http://cdn.buzzbooklet.com/pic/" + filename;
}

function parseHtmlEnteties(str) {
    return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
}
