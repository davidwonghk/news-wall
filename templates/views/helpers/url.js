var keystone = require('keystone');
var cloudinary = require('cloudinary');

module.exports = function () {

	var _url = {};

	// ### CloudinaryUrl Helper
	// Direct support of the cloudinary.url method from Handlebars (see
	// cloudinary package documentation for more details).
	//
	// *Usage examples:*
	// `{{{cloudinaryUrl image width=640 height=480 crop='fill' gravity='north'}}}`
	// `{{#each images}} {{cloudinaryUrl width=640 height=480}} {{/each}}`
	//
	// Returns an src-string for a cloudinary image

	_url.cloudinaryUrl = function (context, options) {

		// if we dont pass in a context and just kwargs
		// then `this` refers to our default scope block and kwargs
		// are stored in context.hash
		if (!options && context.hasOwnProperty('hash')) {
			// strategy is to place context kwargs into options
			options = context;
			// bind our default inherited scope into context
			context = this;
		}

		// safe guard to ensure context is never null
		context = context === null ? undefined : context;

		if ((context) && (context.public_id)) {
			options.hash.secure = keystone.get('cloudinary secure') || false;
			var imageName = context.public_id.concat('.', context.format);
			return cloudinary.url(imageName, options.hash);
		}
		else {
			return null;
		}
	};

	// ### abstract how to get the image ###
	// *Usage example:*
	//  `{{#if post.image}}
	//     <img src="{{imageUrl post.image}}" />`
	//   {{/if}}`
	_url.imageUrl = function(image, options) {
		if ( image.local ) {
			return image.local;
		}
		if ( image.cloudinary ) {
			return _url.cloudinaryUrl(image.cloudinary, {hash:{'crop':'fit'}});
		}
		return image.reference;
	};

	// ### Content Url Helpers
	// KeystoneJS url handling so that the routes are in one place for easier
	// editing.  Should look at Django/Ghost which has an object layer to access
	// the routes by keynames to reduce the maintenance of changing urls

	// Direct url link to a specific post
	_url.postUrl = function (postSlug) {
		return ('/post/' + postSlug);
	};

	_url.fullPostUrl = function(postSlug) {
			return (process.env.BASE_URL + '/post/' + postSlug);
	}

	// create the category url for a blog-category page
	_url.categoryUrl = function (categorySlug, options) {
		//return ('/blog/' + categorySlug);
		return ('/?c=' + categorySlug);
	};


	return _url;

};
