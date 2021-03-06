/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

const keystone = require('keystone');
const middleware = require('./middleware');
const importRoutes = keystone.importer(__dirname);

const cookieParser = require('cookie-parser')
const render = require('./render')


// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	ajax: importRoutes('./ajax'),
	api: importRoutes('./api'),
};


// Setup Route Bindings
exports = module.exports = function (app) {

	//custom signin page
	app.get('/signin', render('signin') );
	app.post('/signin', render('signin', {}, {error: '用戶名無效或密碼錯誤'}) );

	//policy pages
	app.get('/policy/:page', middleware.chinese, function(req, res) {
		res	.render('policy/' + req.params.page)
	});

	//report pages
	app.get('/report', render('report', {raw:true}));
	app.post('/report', routes.views.report);


	// Views
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
	app.get('/', middleware.chinese, routes.views.blog);
	app.get('/post/:post', middleware.chinese, routes.views.post);
	app.get('/protected', middleware.requireUser, routes.views.protected);

	app.get('/ajax/posts/:timestamp', routes.ajax.posts);
	app.get('/ajax/tags', routes.ajax.tags);			//nt. cacheable

	app.get('/api/crawl', middleware.onlyMe, routes.api.crawl);
	app.get('/api/sync/:action', middleware.onlyMe, routes.api.sync);

	//use additinal middleware globally
	app.use(cookieParser);

};
