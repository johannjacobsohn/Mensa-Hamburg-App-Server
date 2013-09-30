"use strict";

var
  parseRequest = require("../source/parseRequestMiddleware.js"),
  expect  = require("expect.js"),
  getWeek = require("../source/getweek.js"),
  thisWeekNumber = getWeek(),
  nextWeekNumber = thisWeekNumber + 1;

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
