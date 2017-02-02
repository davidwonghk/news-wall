var cheerio = require('cheerio')  ;
var url = require('url');
var striptags = require('striptags');
var request = require('request');


/**
callback
    'title': title,
    'tags': [tag],
    'imageUrl': imageUrl,
    'link': link,
		'content': {html:html}
*/
exports = module.exports = function (iteration, callback) {

	const current = Date.now()/1000;
	crawlCard(iteration, current, function(err, data) {
    if(err) { callback(err); return; }

		crawlLink(data.references[0], function(err, html) {
	    if(err) { callback(err); return; }
			data['content'] = {'html': html};
			console.log('crawl ' + data.references[0]);
			callback(null, data);
		});

	});
};



function crawlCard(iteration, timestamp, callback) {
	if (iteration <= 0) return;

	const url = getCardListUrl(timestamp);
	request(url, function(err, resp, body) {
		if (err) { callback(err); return; }

		var json = JSON.parse(body);
		crawlCard(iteration-1, json['build'], callback);

		for (k in json.new_card_list) {
			var card = json.new_card_list[k];
			var data = {
				'references': [getCardUrl(card['card_id'], card['uri_title']), parseHtmlEnteties(card['url'])],
				'from': {'site': card['website'], 'author': card['user_name']},
				'imageUrl': getImageUrl(card['image_path']),
				'title': card['title'],
			}

			callback(null, data);
		}

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
