var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */

var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Post.add({
	title: { type: String, required: true },
	titleFull: { type: String },
	state: { type: Types.Select, options: 'draft, published, posted, archived', default: 'draft', index: true },
	source: { type: Types.Select, options: 'manual, yahoo', default: 'manual' },
	publishedDate: { type: Types.Datetime, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: { type: Types.Html, wysiwyg: true, height: 400 },
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
});

Post.schema.virtual('content.full').get(function () {
	return this.content;
});

Post.schema.virtual('Title').get(function () {
	if(this.titleFull) return this.titleFull;
	return this.title;
});

Post.defaultColumns = 'title, state|20%, source|20%, publishedDate|20%';
Post.register();
