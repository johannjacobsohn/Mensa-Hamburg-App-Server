/*
	Base module. Routes requests and negotiates content. Writes logs.
	Requires other modules
*/
"use strict";
var
  express = require('express'),
  get = require("./get.js").get,
  parseRequest = require("./parseRequestMiddleware.js").parseRequest,
  port = 8080,
  fs = require("fs"),
  logFile = fs.createWriteStream('./logs/access.log', {flags: 'a'});

// https://gist.github.com/2344435
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
	// intercept OPTIONS method
	if ('OPTIONS' === req.method) {
		res.send(200);
	} else {
		next();
	}
};

/*
 * Construct new reply
 */
var reply = function(req, res){
	get(req, req.mensen, req.weeks, function(error){
		if(error){
			console.error(new Date(), req.mensen, req.weeks, "get error");
			res.send(500, JSON.stringify({menu:[]}));
		} else {
			res.send({menu: req.result});
		}
	});
};

/*
 * Construct old reply
 */
var legacyReply = function(req, res){
	get(req, req.mensen, req.weeks, function(error){
		if(error){
			console.error(new Date(), req.mensen, req.weeks, "get error");
			res.send(500, JSON.stringify([]));
		} else {
			res.send(req.result);
		}
	});
};

// log exceptions
//process.on('uncaughtException', function (err) {
//	console.error(new Date(), 'uncaught exception: ' + err);
//});


/////////////////////////////
// Finaly start the server: /
/////////////////////////////
var app = express()
	.use(allowCrossDomain)                                // allow other domains via CORS header
	.use(express.logger({stream: logFile}))               // log to access.log
	.use(express.compress())                              // use compression
	.use(parseRequest)                                    // process parameters from request
	.use(function(err, req, res, next){                   // catch errors
		console.error(new Date(), err.stack);
		res.send(500, JSON.stringify({menu:[]}));
	})
	.use(express.vhost('menu.mensaapp.org', legacyReply)) // legacy server for old domain
	.use(express.vhost('data.mensaapp.org', reply))       // new server for new domain
	.use(express.vhost('localhost', reply))               // new server for local testing
	.use(express.vhost('localhost-legacy', legacyReply))  // legacy server for local testing
	.listen(port);

console.log("Server running at http://localhost:"+port+"/");
