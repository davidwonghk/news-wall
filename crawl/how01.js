const cheerio = require('cheerio');
const request = require('../util/request').get;
const chinese = require('../util/chinese');

const keystone = require('keystone'),
    Post = keystone.list('Post');

var log = require('logger')(__filename);


exports = module.exports = function (num, callback) {
	Post.model.findOne()
		.where('from.site', source)
    .select('reference  -_id')
		.sort({createdDate: -1})
		.exec(function(err, post) {
			if (err) return callback(err);

			var offset = 0;
			if (post.reference) {
				offset = _grepArticleId(post.reference);
			}

			for (var i=offset+1; i<=offset+num; i++) {
				_crawl(i, callback);
			}
		});
}


const source = 'www.how01.com';

function _crawl(id, callback) {
	const url = _getArticleUrl(id);

	request(url, function(err, resp, html) {
		if (err) return callback(err);

    var $ = cheerio.load(html);
		var data = {
			'title': $('meta[property="og:title"]').attr('content'),
			'reference': url,
			'imageUrl': $('meta[property="og:image"]').attr('content'),
			'from': { 'site': source, 'link': url, 'author':'愛分享'},
			'tags': [],
		}

		//crawl tags
		$('a', '.ui_breadcrumbs').each(function(i,ele) {
			var tag = $(ele).text().trim();
			if (tag != '首頁') {
				data.tags.push(tag);
			}
		});

		$('a', 'div.keyword').each(function(i,ele) {
			data.tags.push($(ele).text().trim());
		});

    //remove the btn_report and related span
    $('li.tips').remove();

		//convert content html to tranditional chinese
		var html = $('#detailMain').html();
		chinese.toTranditional(html, function(err, converted) {
			data['content'] = {'html': converted};
			callback(null, data);
		});
	});
}	//exports


function _getArticleUrl(num) {
	return "http://"+source+"/article_"+num.toString()+".html"
}


function _grepArticleId(articleUrl) {
	var s = articleUrl.indexOf('article_') + 8;
	var e = articleUrl.indexOf('.', s);
	var offset = articleUrl.substring(s, e);
	return parseInt(offset);
}
