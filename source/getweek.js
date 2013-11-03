"use strict";

// http://syn.ac/tech/19/get-the-weeknumber-with-javascript/
module.exports = function(date) {
	date = date || new Date();
	var determinedate = new Date();
	determinedate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
	var D = determinedate.getDay();
	if(D === 0){ D = 7; }
	determinedate.setDate(determinedate.getDate() + (4 - D));
	var YN = determinedate.getFullYear();
	var ZBDoCY = Math.floor((determinedate.getTime() - new Date(YN, 0, 1, -6)) / 86400000);
	var WN = 1 + Math.floor(ZBDoCY / 7);
	return WN;
};
