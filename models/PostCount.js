const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * PostCount Model
 * ==================
 */

var PostCount = new keystone.List('PostCount', {
	map: { name: 'post' },
	defaultSort: '-count'
});

PostCount.add({
	post: { type: Types.Relationship, ref: 'Post', many: false},
	count: { type: Types.Number },
});


PostCount.defaultColumns = 'post,count|15%';
PostCount.register();
