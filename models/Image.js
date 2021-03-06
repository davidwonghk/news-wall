const keystone = require('keystone');
const Types = keystone.Field.Types;
const cloudinary = require('cloudinary');

const request = require('../util/request')
const fs = require('fs');

var log = require('logger')(__filename);


/**
 * Image Model
 * ==========
 */

var Image = new keystone.List('Image');


Image.add({
	cloudinary: { type: Types.CloudinaryImage },
	reference: { type: Types.Url },
});


Image.schema.virtual('localPath').get(function() {
	return 'public/img/'+ this.id;
});

Image.schema.virtual('local').get(function() {
	return '/img/' + this.id;
});

/**
 * callback: function(err)
 */
Image.schema.methods.publish = function(post, callback) {
		if (!this.reference) return callback('reference not found');

		var headers = {Referer: post.reference};
		request.download(this.reference, this.localPath, headers, function() {
				var remotePath = process.env.BASE_URL + this.local;
				log.trace('try upload ' + remotePath + ' to cloudinary');
				cloudinary.uploader.upload(remotePath, function(result) {
					this.cloudinary = result;
					this.save(callback);
				}.bind(this));
		}.bind(this));

}


Image.schema.pre('remove', function(next) {
	fs.unlink(this.localPath, next)
});


Image .defaultColumns = 'reference, cloudinary|30%'

Image.relationship({ ref: 'Post', refPath: 'image' });

Image.register();
