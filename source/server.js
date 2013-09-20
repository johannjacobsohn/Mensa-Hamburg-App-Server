"use strict";
var url = require("url"),
	mensa = require("./urls.js"),
	express = require('express'),
	fs = require("fs"),
	get = require("./get.js").get,
	port = 8080,
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
 * Parse Parameters of request
 */
var parseParameters = function(req, res, next){
	var s = url.parse(req.url).pathname.split("/");
	req.mensen = s[1].toLowerCase().split(",").filter(function(mensaId){
		return !!mensa.byId[mensaId];
	});

	if(s[2] === "both"){
		s[2] = "this,next";
	}
	req.weeks  = s[2] ? s[2].split(",") : ["this"];
	req.weeks = req.weeks.map(function(w){
		if(w === "this"){
			w = (new Date()).getWeek();
		} else if(w === "next"){
			w = (new Date( +new Date() + 1000*3600*24*7 )).getWeek();
		}
		return w;
	});
	next();
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


// http://syn.ac/tech/19/get-the-weeknumber-with-javascript/
Date.prototype.getWeek = function() {
	var determinedate = new Date();
	determinedate.setFullYear(this.getFullYear(), this.getMonth(), this.getDate());
	var D = determinedate.getDay();
	if(D === 0){ D = 7; }
	determinedate.setDate(determinedate.getDate() + (4 - D));
	var YN = determinedate.getFullYear();
	var ZBDoCY = Math.floor((determinedate.getTime() - new Date(YN, 0, 1, -6)) / 86400000);
	var WN = 1 + Math.floor(ZBDoCY / 7);
	return WN;
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
	.use(function(err, req, res, next){                   // catch errors
		console.error(new Date(), err.stack);
		res.send(500, '{}');
	})
	.use(parseParameters)                                 // process parameters from request
	.use(express.vhost('menu.mensaapp.org', legacyReply)) // legacy server for old domain
	.use(express.vhost('data.mensaapp.org', reply))       // new server for new domain
	.use(express.vhost('localhost', reply))               // new server for local testing
	.use(express.vhost('localhost-legacy', legacyReply))  // legacy server for local testing
	.listen(port);

console.log("Server running at http://localhost:"+port+"/");
