const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * PostTag Model
 * ==================
 */

var PostTag = new keystone.List('PostTag', {
	autokey: { from: 'name', path: 'key', unique: true },
});

PostTag.add({
	name: { type: String, required: true },
	count: { type: Types.Number },
});


PostTag.register();
