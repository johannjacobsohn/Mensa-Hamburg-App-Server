/**
 * retrieverJS
 * 
 * Retrieves data and calls parser to process that data into JSON
 * 
 * @TODO write tests
 * @TODO Document
 * @TODO protect against failure in parser
 */
/*jshint node:true*/
"use strict";
function retrieve(mensa, week, callback){
	var request = require("request"),
	    urls = require("./urls.js").urls,
	    parser = require("./parser.js").parser;
	
	var id = urls.ids[mensa];
	var url = urls.mensenWeek[id];
	 
	if( url && !isNaN(parseInt(week,10)) ){ // this, next week
		console.log(new Date(), "retrieve", url.replace(/{{week}}/, week));
		request({ 
			uri: url.replace(/{{week}}/, week)
		}, function(err, response, body) {
			if(!err){
				callback( null, parser[urls[id].parser](body, mensa, week) );
			} else {
				console.log(new Date(), err);
				callback( {} );
			}
		});
	} else {
		console.error( new Date(), "Cannot Retrieve:", mensa, "with id", id, "in week", week, "which maps to", url );
		callback( {} );
	}
}

exports.retrieve = retrieve;
