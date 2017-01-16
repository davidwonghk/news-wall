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
	redirect: { type: Boolean, default: false },
	state: { type: Types.Select, options: 'draft, published, posted, archived', default: 'draft', index: true },
	publishedDate: { type: Types.Datetime, dependsOn: { state: 'published' } },
	image: { type: Types.CloudinaryImage },
	content: { type: Types.Html, wysiwyg: true, height: 400 },
	description: {type: String}
});

Post.schema.virtual('url').get(function() {
    return process.env.BASE_URL + '/blog/post/' + this.slug;
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


Post.defaultColumns = 'title, state|15%, publishedDate|15%, redirect|10%';
Post.register();
