/*
 * Parse Parameters of request
 */
"use strict";

var
  url = require("url"),
  getWeek = require("./getweek.js"),
  mensa = require("./urls.js");


//~ http://stackoverflow.com/questions/1960473/unique-values-in-an-array
function unique(value, index, self) {
	return self.indexOf(value) === index;
}

module.exports = function(req, res, next){
	var s = url.parse(req.url).pathname.split("/");

	// parse mensen
	req.mensen = s[1].toLowerCase().split(",").filter(function(mensaId){
		return !!mensa.byId[mensaId];
	});
	req.mensen = req.mensen.filter(unique);

	//parse weeks
	req.weeks = s[2] ? s[2].replace("both", "this,next").split(",") : ["this"];
	req.weeks = req.weeks
		.map(function(w, i, l){
			w = w.toLowerCase();

			if(w === "this"){
				w = getWeek();
			} else if(w === "next"){
				w = getWeek(new Date( +new Date() + 1000*3600*24*7 ));
			}
			return w;
		}, req.weeks)
		.map(function(i){
			return +i;
		})
		.filter(function(i){
			return !isNaN(i);
		})
		.filter(unique)
		.sort(function(a, b){
			return a - b;
		});

	next();
};
