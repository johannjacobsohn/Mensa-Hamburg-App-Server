/**
 * retrieverJS
 * 
 * Retrieves data and calls parser to process that data into JSON
 * 
 * @TODO write tests
 * @TODO Document
 * @TODO protect against failure in parser
 */
"use strict";
function retrieve(mensaId, week, callback){
	var request = require("request"),
	    parser = require("./parser.js").parser,
	    mensa = require("./urls.js").byId[mensaId],
	    url = mensa.url;

	if( url && !isNaN(parseInt(week, 10)) ){
		console.log(new Date(), ": Retrieve ", url.replace(/{{week}}/, week));
		request({
			uri: url.replace(/{{week}}/, week)
		}, function(err, response, body) {
			if(!err){
				callback( null, parser[mensa.parser](body, mensaId, week) );
			} else {
				console.error("%s: Cannot Retrieve: %s in week %d which maps to %s", new Date(), mensaId, week, url);
				callback("request failed");
			}
		});
	} else {
		console.error("%s: Cannot find or parse: mensaId '%s' in week %d", new Date(), mensaId, week);
		callback("arguments malformed");
	}
}

exports.retrieve = retrieve;
