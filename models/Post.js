var keystone = require('keystone');
var Types = keystone.Field.Types;

var striptags = require('striptags');
var slug = require('limax');

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

Post.schema.pre('save', function(next) {
	if (this.isModified('state') && this.isPublished() && !this.publishedAt) {
		this.publishedDate = new Date();
	}

	this.slug = slug(this.title);

	next();
});


Post.defaultColumns = 'title, state|15%, publishedDate|15%, redirect|10%';
Post.register();
