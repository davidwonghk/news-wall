var request = require('request');
var fs = require('fs');

var UA_HEADER = {'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:50.0) Gecko/20100101 Firefox/50.0"};

exports = module.exports = {

/*
// set some defaults
request : request.defaults({
	jar: true,                 // save cookies to jar
	rejectUnauthorized: false,
	followAllRedirects: true   // allow redirections
}),
*/

get: function(url, callback) {
  request.get( {url: url, headers: UA_HEADER}, callback );
},

download: function(url, to, headers, callback) {

  headers['User-Agent'] = UA_HEADER['User-Agent']
	var r = request.get({url: url, headers: headers});

  r.on('response', function(res) {
  	var file = fs.createWriteStream(to);
	  res.pipe(file);
  });

  r.on('end', function(){
		console.log("downloaded: " + url + " to " + to);
    callback();
  });
},

}
