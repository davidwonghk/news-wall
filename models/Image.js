var keystone = require('keystone');
var Types = keystone.Field.Types;
var cloudinary = require('cloudinary');

var util = require('../crawl/util')

/**
 * Image Model
 * ==========
 */

var Image = new keystone.List('Image');


Image.add({
	cloudinary: { type: Types.CloudinaryImage },
	reference: { type: Types.Url },
	local: {type: Types.Text},		//the local url after downloading
});



Image.schema.methods.publish = function(post, callback) {
		if (!this.reference) return callback('reference not found');

		var headers = {Referer: post.reference};
		this.local = "/img/" + this.id;
		util.download(this.reference, 'public'+this.local, headers, function() {
			cloudinary.uploader.upload(this.local, function(result) {
				this.cloudinary = result;
				this.save(callback);
			}.bind(this));
		}.bind(this));

}


Image .defaultColumns = 'reference, cloudinary|30%'

Image.relationship({ ref: 'Post', refPath: 'image' });

Image.register();
