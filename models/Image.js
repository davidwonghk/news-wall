var keystone = require('keystone');
var Types = keystone.Field.Types;
var cloudinary = require('cloudinary');


/**
 * Image Model
 * ==========
 */

var Image = new keystone.List('Image');


Image.add({
	cloudinary: { type: Types.CloudinaryImage },
	reference: { type: Types.Url },
});


Image.schema.pre('save', function(next) {
	if (!this.reference || this.cloudinary.length ) {
		next();
	}

	cloudinary.uploader.upload(this.reference, function(result) {
		this.cloudinary = result;
		next();
	}.bind(this));

});


Image .defaultColumns = 'reference, cloudinary|30%'

Image.relationship({ ref: 'Post', refPath: 'image' });

Image.register();
