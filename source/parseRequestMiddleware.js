/*
 * Parse Parameters of request
 */
"use strict";

var
  url = require("url"),
  getWeek = require("./getweek.js"),
  mensa = require("./urls.js");

// http://stackoverflow.com/questions/1960473/unique-values-in-an-array
function unique(value, index, self) {
	return self.indexOf(value) === index;
}

// check that week is this or next week
function inrange(week){
	var now = new Date();
	var next = new Date(+now + 7*24*3600*1000);
	return week === getWeek(now) || week === getWeek(next);
}

function isMensa(mensaId){
	return !!mensa.byId[mensaId];
}

function toNumber(i){
	return +i;
}

function notNaN(i){
	return !isNaN(i);
}

function numericSort(a, b){
	return a - b;
}

module.exports = function(req, res, next){
	var s = url.parse(req.url).pathname.split("/");

	// parse mensen
	req.mensen = s[1].toLowerCase().split(",").filter(isMensa).filter(unique);

	//parse weeks
	req.weeks = s[2] ? s[2].replace("both", "this,next").split(",") : ["this"];
	req.weeks = req.weeks
		.map(function(w){
			w = w.toLowerCase();

			if(w === "this"){
				w = getWeek();
			} else if(w === "next"){
				w = getWeek(new Date( +new Date() + 1000*3600*24*7 ));
			}
			return w;
		})
		.map(toNumber)
		.filter(notNaN)
		.filter(unique)
		.filter(inrange)
		.sort(numericSort);

	next();
};
