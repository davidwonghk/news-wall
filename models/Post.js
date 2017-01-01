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
	categories: { type: Types.Relationship, ref: 'PostCategory', many: true },
	reference: { type: Types.Url },
	redirect: { type: Boolean, default: true },
	state: { type: Types.Select, options: 'draft, published, posted, archived', default: 'draft', index: true },
	source: { type: Types.Select, options: 'manual, yahoo', default: 'manual' },
	publishedDate: { type: Types.Datetime, index: true, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: { type: Types.Html, wysiwyg: true, height: 400 },
});

Post.schema.virtual('content.full').get(function () {
	return this.content;
});

Post.schema.methods.isPublished = function() {
    return this.state == 'published';
}

Post.schema.pre('save', function(next) {
    if (this.isModified('state') && this.isPublished() && !this.publishedAt) {
        this.publishedDate = new Date();
    }
    next();
});


Post.defaultColumns = 'title, state|15%, source|20%, publishedDate|15%, redirect|10%';
Post.register();
