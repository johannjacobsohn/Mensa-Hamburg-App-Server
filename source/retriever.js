/**
 * retrieverJS
 * 
 * Retrieves data and calls parser to process that data into JSON
 */
"use strict";
function retrieve(mensaId, week, callback){
	var request = require("request"),
	    parser = require("./parser.js").parser,
	    mensa = require("./urls.js").byId[mensaId],
	    url = mensa.url;

	if( url && !isNaN(parseInt(week, 10)) ){
		//~ console.log(new Date(), ": Retrieve ", url.replace(/{{week}}/, week));

		if(url.indexOf(".pdf") !== -1){
			var name = mensaId + week + ".pdf";
			var fs = require('fs');
			if(url.indexOf(".pdf") !== -1){
				var r = request( url.replace(/{{week}}/, week) ).on('end', function () {
					parser[mensa.parser](name, mensaId, week, callback);
				}).pipe(fs.createWriteStream(name));
			}
		} else {
			request({
				uri: url.replace(/{{week}}/, week)
			}, function(err, response, body) {
				if(!err){
					if(url.indexOf(".pdf") !== -1){
						var name = mensaId + week + ".pdf";
						fs.writeFile(mensaId + week + ".pdf", body, function(err) {
							if(err) {
								console.log(err);
							} else {
								parser[mensa.parser](name, mensaId, week, callback);
							}
						});
					} else {
						try{
							parser[mensa.parser](body, mensaId, week, callback);
						} catch(e) {
							console.error("%s: Error while parsing: %s in week %d which maps to %s", new Date(), mensaId, week, url, body, e);
							callback("request failed");
						}
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

exports.retrieve = retrieve;
