const keystone = require('keystone'),
    Image = keystone.list('Image');

const Types = keystone.Field.Types;

const striptags = require('striptags');
const slug = require('limax');

var log = require('logger')(__filename);


/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	//autokey: { path: 'slug', from: 'title', unique: true },
});



Post.add({
	slug: { type: String, hidden: true },
	title: { type: String, required: true },
	tags: { type: Types.TextArray },
	reference: { type: Types.Url },
	from: {
		site: {type: String },
		author: {type: String},
    url: {type: Types.Url},
	},
	redirect: { type: Boolean, default: false },
	state: { type: Types.Select, options: 'draft, published, posted, archived', default: 'draft', index: true },
	publishedDate: { type: Types.Datetime, dependsOn: { state: 'published' } },
	createdDate: { type: Types.Datetime },
  imageUrl: {type: Types.Url},
	image: { type: Types.Relationship, ref: 'Image', many: false},
	content: {
		html: {type: Types.Html, wysiwyg: true, height: 400},
		markdown: {type: Types.Markdown, height: 400}
	},
	description: {type: String}
});


Post.schema.virtual('Title').get(function() {
	return decodeURI(this.title);
});

//------------------------------------------------------------

Post.schema.virtual('Content').get(function() {
	if (!this.content) return "";
	return this.content.markdown.html || this.content.html;
});

Post.schema.virtual('Description').get(function() {
	return this.description || striptags(this.Content.substring(0,256));
});

Post.schema.methods.isPublished = function() {
	return this.state == 'published';
}

//------------------------------------------------------------
//TODO: heavy logic, maybe a helper class in future

var async = require('async');
var cheerio = require('cheerio')  ;

/**
 * not yet support relative path crawling
 * callback(err, image)
 */
function _urlToImage(url, callback) {
  //skip download the image again if it is in db
  Image.model.findOne({'reference': url}).exec(function(err, exists){
    if (err) return callback(err);
    if (exists)  return callback(err, exists);

    var image = new Image.model({reference:url});
    image.save(function(err) {
      callback(err, image);
    });
  });
}

/**
 * @param eachCallback function(image, imageDom)
 * @param postCallback function(error, html)
 */
Post.schema.methods.forEachImages = function(eachCallback, postCallback) {
  if (!this.content.html) { return postCallback(); }

	var $ = cheerio.load(this.content.html);

	async.reduce($('img'), $, function(s, item, next) {
		var src = s(item).attr('src');
	  if (!src) return next(null, s);

    //crawl the image if it is not yet downloaded
		if (!src.startsWith('/img/')) {
      return _urlToImage(src, function(err, img) {
        if (!err) {
          s(item).attr('src', '/img/'+img._id);
          eachCallback(img, s(item));
        }
        next(err, s);
      });
    }

		var imageId = src.substring(5);
		Image.model.findById(imageId).exec(function(err, image) {
			if (!err) { eachCallback(image, s(item)) }
			return next(err, s);
		} );

	}, function(err) {
    postCallback(err, $.html());
  });
}



//------------------------------------------------------------
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

var _onPublish = function(post, next) {
  var isModifyContent = post.isModified('content.html');

	if (post.isModified('state') && !post.publishedDate) {
    //first time publish
		post.publishedDate = new Date();
    isModifyContent = true;
  }

  if (isModifyContent) {
    //on publishing a post
  	//download the image from reference Url to local, with Referer set
  	post.forEachImages(function(image, imageDom) {
  		image.publish(post, function(err) {
  			if (err) log.error("error during publishing image", err);
  		});
  	}, function(err, html) {
      if (!err && html) {
        post.content.html = html;
      }
      next(err);
    });
  } //if isModified content
  else {
    next();
  }
};

Post.schema.pre('save', function(next) {
  //limit slug to 128 character
  var slugTitle = slug(this.title, {tone:false});
  if (slugTitle.lengh > 64) {
    slugTitle = slugTitle.substring(0, 64);
  }
	this.slug = slugTitle;


  //set createdDate
  if (!this.createdDate) {
    this.createdDate = new Date();
  }

  if (this.isModified('reference') && this.reference) {
    this.reference = encodeURI(this.reference);
    log.trace("encode reference to ", this.reference);
  }

  if (this.isPublished()) {
    _onPublish(this, function(err) {
      if (!this.imageUrl) {
        return next(err);
      }

			_urlToImage(this.imageUrl, function(err, image) {
				if (err) return next(err);
        this.image = image;
        delete this.imageUrl;
        image.publish(this, next);
			}.bind(this));
    }.bind(this));
  } else {
    next();
  }



});

Post.schema.pre('remove', function(next) {
	this.forEachImages(function(err, image) {
    if (err) log.error("each image", err)
    if (!image) return;
		image.remove(function(err) {
      if (err) log.error("remove image", err);
		});
	}, function(err) {
			next(err);
	})
});


Post.defaultColumns = 'title, state|15%, publishedDate|15%, redirect|10%';
Post.register();
