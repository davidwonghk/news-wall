var moment = require('moment');
var _ = require('underscore');
var hbs = require('handlebars');
var keystone = require('keystone');

// Collection of templates to interpolate
var scriptTemplate = _.template('<script src="<%= src %>"></script>');
var cssLinkTemplate = _.template('<link href="<%= href %>" rel="stylesheet">');

module.exports = function () {

	var _helpers = {};

	/**
	 * Generic HBS Helpers
	 * ===================
	 */

	// standard hbs equality check, pass in two values from template
	// {{#ifeq keyToCheck data.myKey}} [requires an else blockin template regardless]
	_helpers.ifeq = function (a, b, options) {
		if (a == b) { // eslint-disable-line eqeqeq
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	};

	/**
	 * Port of Ghost helpers to support cross-theming
	 * ==============================================
	 *
	 * Also used in the default keystonejs-hbs theme
	 */

	// ### Date Helper
	// A port of the Ghost Date formatter similar to the keystonejs - jade interface
	//
	//
	// *Usage example:*
	// `{{date format='MM YYYY}}`
	// `{{date publishedDate format='MM YYYY'}}`
	//
	// Returns a string formatted date
	// By default if no date passed into helper than then a current-timestamp is used
	//
	// Options is the formatting and context check this.publishedDate
	// If it exists then it is formated, otherwise current timestamp returned

	_helpers.date = function (context, options) {
		if (!options && context.hasOwnProperty('hash')) {
			options = context;
			context = undefined;

			if (this.publishedDate) {
				context = this.publishedDate;
			}
		}

		// ensure that context is undefined, not null, as that can cause errors
		context = context === null ? undefined : context;

		var f = options.hash.format || 'MMM Do, YYYY';
		var timeago = options.hash.timeago;
		var date;

		// if context is undefined and given to moment then current timestamp is given
		// nice if you just want the current year to define in a tmpl
		if (timeago) {
			date = moment(context).fromNow();
		} else {
			date = moment(context).format(f);
		}
		return date;
	};


	/**
	 * KeystoneJS specific helpers
	 * ===========================
	 */

	// block rendering for keystone admin css
	_helpers.isAdminEditorCSS = function (user, options) {
		var output = '';
		if (typeof (user) !== 'undefined' && user.isAdmin) {
			output = cssLinkTemplate({
				href: '/keystone/styles/content/editor.min.css',
			});
		}
		return new hbs.SafeString(output);
	};

	// block rendering for keystone admin js
	_helpers.isAdminEditorJS = function (user, options) {
		var output = '';
		if (typeof (user) !== 'undefined' && user.isAdmin) {
			output = scriptTemplate({
				src: '/keystone/js/content/editor.js',
			});
		}
		return new hbs.SafeString(output);
	};

	// Used to generate the link for the admin edit post button
	_helpers.adminEditableUrl = function (user, options) {
		var rtn = keystone.app.locals.editable(user, {
			list: 'Post',
			id: options,
		});
		return rtn;
	};


	//  KeystoneJS supports a message interface for information/errors to be passed from server
	//  to the front-end client and rendered in a html-block.  FlashMessage mirrors the Jade Mixin
	//  for creating the message.  But part of the logic is in the default.layout.  Decision was to
	//  surface more of the interface in the client html rather than abstracting behind a helper.
	//
	//  @messages:[]
	//
	//  *Usage example:*
	//  `{{#if messages.warning}}
	//      <div class="alert alert-warning">
	//          {{{flashMessages messages.warning}}}
	//      </div>
	//   {{/if}}`

	_helpers.flashMessages = function (messages) {
		var output = '';
		for (var i = 0; i < messages.length; i++) {
			if (typeof messages[i] == 'string') {
				output += '<h4>' + messages[i] + '</h4>';
				continue;
			}

			if (messages[i].title) {
				output += '<h4>' + messages[i].title + '</h4>';
			}

			if (messages[i].detail) {
				output += '<p>' + messages[i].detail + '</p>';
			}

			if (messages[i].list) {
				output += '<ul>';
				for (var ctr = 0; ctr < messages[i].list.length; ctr++) {
					output += '<li>' + messages[i].list[ctr] + '</li>';
				}
				output += '</ul>';
			}
		}
		return new hbs.SafeString(output);
	};


	//  ### underscoreMethod call + format helper
	//	Calls to the passed in underscore method of the object (Keystone Model)
	//	and returns the result of format()
	//
	//  @obj: The Keystone Model on which to call the underscore method
	//	@undescoremethod: string - name of underscore method to call
	//
	//  *Usage example:*
	//  `{{underscoreFormat enquiry 'enquiryType'}}

	_helpers.underscoreFormat = function (obj, underscoreMethod) {
		return obj._[underscoreMethod].format();
	};

	//export sub-modules
	_helpers = Object.assign(_helpers, require('./url'));
	return _helpers;
};
