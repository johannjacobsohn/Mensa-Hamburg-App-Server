/*
	Base module. Routes requests and negotiates content. Writes logs.
	Requires other modules
*/
"use strict";
var
  express = require("express"),
  morgan = require("morgan"),
  vhost = require("vhost"),
  compression   = require("compression"),
  get = require("./get.js").get,
  urls = require("./urls.js"),
  parseRequest = require("./parseRequestMiddleware.js"),
  allowCrossDomain = require("./allowCrossDomainMiddleware.js"),
  port = 8081,
  logFile = require("fs").createWriteStream("./logs/access.log", {flags: "a"});

// use to compress output
function minimize(menu){
	return menu.map(function(item){
		item._id = undefined;  // useless in app
		item.__v = undefined;  // useless in app
		item.createdAt = undefined;
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
		var menu;
		if(error){
			console.error(new Date(), "legacy error", req, error);
			res.send(500, JSON.stringify([]));
		} else {
			menu = minimize(req.result);
			// rewrite to legacy format
			menu = menu.map(function(item){
				item.date = item.date.getFullYear() + "-" + (item.date.getMonth() + 1) + "-" + item.date.getDate();
				item.mensa = urls.byId[item.mensaId].name;
				item.studPrice = item.studPrice.toFixed(2).toString().replace(".", ",");
				item.normalPrice = item.normalPrice.toFixed(2).toString().replace(".", ",");
				item.dish = item.name;
				item.name = item.type;
				delete item.type;
				delete item.mensaId;
				return item;
			});
			res.send( menu );
		}
	});
};

// log exceptions
process.on("uncaughtException", function (err) {
	console.error(new Date(), "uncaught exception: " + err);
});


/////////////////////////////
// Finaly start the server: /
/////////////////////////////
var formatString = {
	"remote-addr": ":remote-addr",
	"X-Forwarded-For": ":req[X-Forwarded-For]",
	"date": ":date",
	"url": ":url",
	"user-agent": ":user-agent",
	"response-time": ":response-time"
};


var app = express()
	.use(morgan({stream: logFile, format: JSON.stringify(formatString)}))               // log to access.log
	.use(allowCrossDomain)                                // allow other domains via CORS header
	.use(compression())                              // use compression
	.use(parseRequest)                                    // process parameters from request
	.use(function(err, req, res, next){                   // catch errors
		console.error(new Date(), err.stack);
		res.send(500, JSON.stringify({menu:[]}));
	})
	.use(vhost("menu.mensaapp.org", legacyReply)) // legacy server for old domain
	.use(vhost("data.mensaapp.org", reply))       // new server for new domain
	.use(vhost("localhost", function(req, b, c){
		if(req.headers["x-forwarded-host"] === "menu.mensaapp.org"){
			legacyReply(req, b, c);
		} else {
			reply(req, b, c);
		}
	}))               // new server for local testing
	.use(vhost("localhost-legacy", legacyReply))  // legacy server for local testing
	.listen(port);

console.log("Server running at http://localhost:"+port+"/");
