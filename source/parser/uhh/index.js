"use strict";
var cheerio = require("cheerio");

// http://stackoverflow.com/questions/4555324/get-friday-from-week-number-and-year-in-javascript
function monday(week){
	var year = new Date().getFullYear(),
	    j10  = new Date( year,0,10,12,0,0),
	    j4   = new Date( year,0,4,12,0,0),
	    mon1 = j4.getTime() - j10.getDay() * 86400000;
	return new Date(mon1 + (week - 1)  * 7 * 86400000);
}

exports.parser = function(body, mensaId, week, callback){
	var weekMenu = [];
	var $ = cheerio.load(body);

	// assume week to be correct.
	var startdate = +monday(week);

	$("table").first().find("tr").each(function(){
		var $tr = $(this);
		// Parse Dishname
		var dishName = $tr.find("th").first().text().trim().replace(/_+$/, "");
		$tr.find("td").each(function(i){
			var $td = $(this);
			$td.find("p").each(function(){
				var $pi = $(this), l = 0, properties = [], additives = [],
					tempObj = {}, dish = "", imgs = [], spans = [], title = "",
					price = "", studPrice = 0, normalPrice = 0,
					date = new Date(startdate + (i) * 24 * 60 * 60 * 1000);
				// parse price
				var priceEl = $pi.find(".price");
				if(priceEl.length){
					price = priceEl.text().replace("€","").replace(" ","").split("/");
					priceEl.remove(); // remove price
				} else {
					// try to match the price with a regexp
					price = priceEl.text().match(/[0-9]+,[0-9][0-9]/g) || ["0", "0"];
					price = price.length === 2 ? price : ["0", "0"];
					$pi.html($pi.html().replace(/[0-9]+,[0-9][0-9]/g,"")); // remove Price from String
				}
				studPrice = parseFloat( price[0].replace(/[^0-9,]/g,"").replace(",", "."), 10 );
				normalPrice = parseFloat( price[1].replace(/[^0-9,]/g,"").replace(",", "."), 10 );

				// Parse Properties
				imgs = $pi.find("img");
				for ( l = 0; l < imgs.length; l++ ) {
					title = $(imgs[l]).attr("title");
					tempObj[title] = title;
				}

				for ( var key in tempObj ) {
					if( tempObj.hasOwnProperty(key) ){
						properties.push(key);
					}
				}
				tempObj = {};

				// Parse Additives
				spans = $pi.find("span");
				for ( l = 0; l < spans.length; l++ ) {
					if($(spans[l]).hasClass("tooltip")) {
						title = $(spans[l]).attr("title");
						tempObj[title] = title;
					}
				}

				for ( key in tempObj ) {
					if( tempObj.hasOwnProperty(key) ){
						additives.push(key);
					}
				}

				// parse dish
				dish = $pi.text();
				dish = dish.replace(/&nbsp;/g, ""); // remove hard whitespace
				dish = dish.replace(/\(([0-9.]+,?[\s]*)*\)/g, " "); // remove additives and replace with an empty space in case the preceding an following words are not separated
				dish = dish.replace(/[\s]+,[\s]*/g, ", "); // fix ugly comma placement, eg. "a ,b"
				dish = dish.replace(/[\s]+/g, " ").trim(); // remove exessive whitespaces

				weekMenu.push({
					mensaId     : mensaId,
					type        : dishName,
					name        : dish,
					studPrice   : studPrice,
					normalPrice : normalPrice,
					date        : date,
					properties  : properties,
					additives   : additives
				});
			});
		});
	});
	callback(null, weekMenu);
};
