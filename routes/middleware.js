/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
const _ = require('lodash');
const keystone = require('keystone');
const MobileDetect = require('mobile-detect');
const Filter = require('./filter');

var log = require('logger')(__filename);

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals = {
		user : req.user,
		baseUrl : process.env.BASE_URL,
		develop : process.env.DEVELOP,
		mobile : new MobileDetect(req.headers['user-agent']).mobile(),
		admin : {
			appName: 'News-Wall',
			fbAppId: '361801474173911',
		  lastUpdated: '2017年07月22日',
		},
		ga: {
			trackingId: 'UA-103610924-1'
		}
	};

	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};


exports.onlyMe = function(req, res, next) {
	if (req.headers['user-agent']!='Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:54.0) Gecko/20100101 Firefox/54.0') {
		// HTTP status 404: NotFound
		res.status(404).send('Not found');
	} else {
		next();
	}
}

exports.chinese = function(req, res, next) {
	var filter = Filter(req);
	var oldSend = res.send;

	res.send = function(data) {
		filter.chinese(data, function(err, txt) {
			if (err) {
				log.error ('chinese filter', err);
				txt = data;
			}
			oldSend.apply(res, [txt]);
		});
	};

	next();
}
