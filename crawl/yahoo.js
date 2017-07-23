var cheerio = require('cheerio')  ;
var url = require('url');
var striptags = require('striptags');
const request = require('../util/request').get;


exports = module.exports = function (tag, category, callback) {
  crawlTag(tag, category, function(err, data) {
    if(err) { callback(err); return; }

    crawlLink(data.reference, function(err, html) {
      if(err) { callback(err); return; }

      data.content.html = html
      callback(err, data);
    })

  });
};


function crawlTag(suburl, tag, callback) {
    const yahooHost = 'https://www.yahoo.com';
    var url = yahooHost + '/style/tagged/' + suburl
    request(url, function(err, resp, html) {
        if (err) { callback(err); return; }
        var $ = cheerio.load(html);

        //var titleTexts = $('.js-stream-content .tile-title-text div')
        var streamContent = $('.js-stream-content');
        for (var i=0, len=streamContent.length; i<len; ++i) {
            var s = streamContent[i];

            //------- title -------
            var title = $('h3.tile-title-text', s).html();

            //------- image -------
            var image = $('.tile-container img', s);
            var imageUrl = image.attr('src');
            if (imageUrl == undefined) {
                imageUrl = null;
            }else {

              if (imageUrl.endsWith('spaceball.gif')) {
                  var ist = image.attr('style');
                  var l1 = ist.lastIndexOf('http');
                  var l2 = ist.indexOf(');', l1);
                  imageUrl = ist.substring(l1, l2);
              }

              var f = imageUrl.indexOf('/http');
              if (f != -1) {
                  imageUrl = imageUrl.substring(f+1);
              }
            }

            //------- link -------
            var link = $('a', s).attr('href');

            callback(null, {
                'title': title,
                'tags': [tag],
                'imageUrl': imageUrl,
                'reference': yahooHost + link,
            });
        }
    } );
}


function crawlLink(link, callback) {
    request(link, function(err, resp, html) {
    if (err) { callback(err); return; }
    var $ = cheerio.load(html);

    var pbody = $('p.canvas-text', 'div.canvas-body');

    var output = '';
    for (var i=0, len=pbody.length; i<len; ++i) {
      var p = pbody[i];
      output += "<p>" + striptags($.html(p)) + "</p>";
    }
    callback(null, output)
  });
}
