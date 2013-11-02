/*
	Base module. Routes requests and negotiates content. Writes logs.
	Requires other modules
*/
"use strict";
var
  express = require('express'),
  get = require("./get.js").get,
  parseRequest = require("./parseRequestMiddleware.js"),
  allowCrossDomain = require("./allowCrossDomainMiddleware.js"),
  port = 8081,
  logFile = require("fs").createWriteStream('./logs/access.log', {flags: 'a'});

// use to compress output
function minimize(menu){
	return menu.map(function(item){
		item._id = undefined;  // useless in app
		item.__v = undefined;  // useless in app
		item.week = undefined; // week can be infered by date
		if(!item.kcal){ // remove if empty or null
			item.kcal = undefined;
		}
		return item;
	});
}

/*
 * Construct new reply
 */
var reply = function(req, res){
	get(req, req.mensen, req.weeks, function(error){
		if(error){
			console.error(new Date(), "current error", req, error);
			res.send(500, JSON.stringify({menu:[]}));
		} else {
			res.send({menu: minimize(req.result)});
		}
	});
};

/*
 * Construct old reply
 */
var legacyReply = function(req, res){
	get(req, req.mensen, req.weeks, function(error){
		if(error){
			console.error(new Date(), "legacy error", req, error);
			res.send(500, JSON.stringify([]));
		} else {
			res.send( minimize(req.result) );
		}
	});
};

// log exceptions
process.on('uncaughtException', function (err) {
	console.error(new Date(), 'uncaught exception: ' + err);
});


/////////////////////////////
// Finaly start the server: /
/////////////////////////////
var app = express()
	.use(express.logger({stream: logFile}))               // log to access.log
	.use(allowCrossDomain)                                // allow other domains via CORS header
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
