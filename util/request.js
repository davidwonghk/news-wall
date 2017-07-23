const request = require('request');
const fs = require('fs');
var log = require('logger')(__filename);

const UA_HEADER = {'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:50.0) Gecko/20100101 Firefox/50.0"};

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
		log.debug("downloaded",  url);
    callback();
  });
},

}
