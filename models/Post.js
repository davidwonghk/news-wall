var keystone = require('keystone'),
    Image = keystone.list('Image');

var Types = keystone.Field.Types;

var striptags = require('striptags');
var slug = require('limax');

var crawlImage = require('../crawl/image')

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
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	references: { type: Types.TextArray	},
	from: {
		site: {type: String },
		author: {type: String}
	},
	redirect: { type: Boolean, default: false },
	state: { type: Types.Select, options: 'draft, published, posted, archived', default: 'draft', index: true },
	publishedDate: { type: Types.Datetime, dependsOn: { state: 'published' } },
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

Post.schema.virtual('reference').get(function() {
	return this.references[0];
});

Post.schema.methods.isPublished = function() {
	return this.state == 'published';
}

//------------------------------------------------------------
//TODO: heavy logic, maybe a helper class in future

var async = require('async');
var cheerio = require('cheerio')  ;

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
      return crawlImage.urlToImage(src, function(err, image) {
        if (!err) {
          s(item).attr('src', '/img/'+image._id);
          eachCallback(image, s(item));
        }
        return next(err, s);
      } );
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

Post.schema.pre('save', function(next) {
	this.slug = slug(this.title);

	if (!this.isModified('state') || !this.isPublished()) {
    return next();
  }

  //first time publish
  if (!this.publishedDate) {
		this.publishedDate = new Date();
  }

  //on publishing a post
	//download the image from reference Url to local, with Referer set
	this.forEachImages(function(image, imageDom) {
		image.publish(this, function(err) {
			if (err) console.log("error during publishing image", err);
		});
	}.bind(this), function(err, html) {
    if (!err && html) {
      this.content.html = html;
    }
    return next(err);
  }.bind(this));

});

Post.schema.pre('remove', function(next) {
	this.forEachImages(function(err, image) {
    if (err) console.log("error each remove image" + err)
    if (!image) return;
		image.remove(function(err) {
      if (err) console.log("error remove image: " + err);
		});
	}, function(err) {
			next(err);
	})
});


Post.defaultColumns = 'title, state|15%, publishedDate|15%, redirect|10%';
Post.register();
