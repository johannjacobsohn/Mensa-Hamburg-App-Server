/**
 * retrieverJS
 *
 * Retrieves data and calls parser to process that data into JSON
 */
"use strict";
function toDoubleDigit(number){
	var n = (""+number);
	return n.length === 1 ? "0"+n : n;
}

function retrieve(mensaId, w, callback){
	var request = require("request"),
	    parser = require("./parser.js").parser,
	    mensa = require("./urls.js").byId[mensaId],
	    week = toDoubleDigit(w),
	    url = mensa.url.replace(/{{week}}/, week);

	if( url && !isNaN(parseInt(week, 10)) ){
		//~ console.log(new Date(), ": Retrieve ", url.replace(/{{week}}/, week));

		if(url.indexOf(".pdf") !== -1){
			var path = mensaId + week + ".pdf";
			var fs = require("fs");
			if(url.indexOf(".pdf") !== -1){
				var r = request( url ).on("end", function () {
					parser[mensa.parser](path, mensaId, week, callback);
				}).pipe(fs.createWriteStream(path));
			}
		} else {
			request({
				uri: url
			}, function(err, response, body) {
				if(!err){
					try{
						parser[mensa.parser](body, mensaId, week, callback);
					} catch(e) {
						console.error("%s: Error while parsing: %s in week %d which maps to %s", new Date(), mensaId, week, url, body, e);
						callback("request failed");
					}
				} else {
					console.error("%s: Cannot Retrieve: %s in week %d which maps to %s", new Date(), mensaId, week, url);
					callback("request failed");
				}
			});
		}
	} else {
		console.error("%s: Cannot find or parse: mensaId '%s' in week %d", new Date(), mensaId, week);
		callback("arguments malformed");
	}
}

module.exports = retrieve;
