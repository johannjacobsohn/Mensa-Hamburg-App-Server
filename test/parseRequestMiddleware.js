"use strict";

var
  parseRequest = require("../source/parseRequestMiddleware.js"),
  expect  = require('expect.js'),
  thisWeekNumber = new Date().getWeek(),
  nextWeekNumber = thisWeekNumber + 1;

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

describe("parseRequestMiddleware", function(){
	var req = {};
	var res = null;
	var noop = function(){};

	it("clears repeated mensen", function(){
		req.url = "/geomatikum,geomatikum//";
		parseRequest(req, res, noop);
		expect(req.mensen).to.eql(["geomatikum"]);
		expect(req.weeks).to.eql([thisWeekNumber]);
	});

	it("parses this, next", function(){
		req.url = "/geomatikum/both,this,next/";
		parseRequest(req, res, noop);
		expect(req.mensen).to.eql(["geomatikum"]);
		expect(req.weeks).to.eql([thisWeekNumber, nextWeekNumber]);
	});
	
	it("parses both", function(){
		req.url = "/geomatikum/both/";
		parseRequest(req, res, noop);
		expect(req.mensen).to.eql(["geomatikum"]);
		expect(req.weeks).to.eql([thisWeekNumber, nextWeekNumber]);
	});

	it("parses weeknumbers", function(){
		req.url = "//54,55,54,56";
		parseRequest(req, res, noop);
		expect(req.mensen).to.eql([]);
		expect(req.weeks).to.eql([54,55,56]);
	});
});
