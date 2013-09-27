/*
 * Parse Parameters of request
 */
"use strict";

var
  url = require("url"),
  mensa = require("./urls.js");

exports.parseRequest = function(req, res, next){
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
				w = (new Date()).getWeek();
			} else if(w === "next"){
				w = (new Date( +new Date() + 1000*3600*24*7 )).getWeek();
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

//~ http://stackoverflow.com/questions/1960473/unique-values-in-an-array
function unique(value, index, self) {
	return self.indexOf(value) === index;
}

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
