/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');
var keystone = require('keystone');
var MobileDetect = require('mobile-detect');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	/*
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Blog', key: 'blog', href: '/blog' },
	];
	*/
	res.locals.user = req.user;
	res.locals.baseUrl = process.env.BASE_URL;
	res.locals.develop = process.env.DEVELOP;
	res.locals.mobile = new MobileDetect(req.headers['user-agent']).mobile();

	res.locals.admin = {
		appName: 'News-Wall',
		fbAppId: '361801474173911',
	  lastUpdated: '2017年07月22日',
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
