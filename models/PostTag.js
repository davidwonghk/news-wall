var keystone = require('keystone');

/**
 * PostTag Model
 * ==================
 */

var PostTag = new keystone.List('PostTag', {
	autokey: { from: 'name', path: 'key', unique: true },
});

PostTag.add({
	name: { type: String, required: true },
});


PostTag.register();
