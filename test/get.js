/*globals before:false, beforeEach:false, after:false */
"use strict";

var
  mockery = require("mockery"),
  expect  = require('expect.js'),
  numberOfCalls = 0,
  get;

describe("get.js", function(){
	var req = {};
	var res = null;
	var noop = function(){};

	before(function(){
		// mock retriever
		mockery.enable({ useCleanCache: true });
		mockery.warnOnUnregistered(false);
		mockery.registerMock('./retriever.js', function(mensa, week, callback){
			numberOfCalls++;

			setTimeout(function(){
				callback(null, [{name:"testdish", week: week, mensaId: mensa}]);
			}, 10);
		});

		get = require("../source/get.js");
	});
	beforeEach(function(done){
		numberOfCalls = 0;
		get.clean(done); // drop database
	});
	after(function(done){
		get.clean(done); // drop database
		mockery.deregisterAll();
	});

	it( "should not request data multiple time", function(done){
		get.get({}, ["geomatikum"], [24], function(){
			get.get({}, ["geomatikum"], [24], function(){
				expect(numberOfCalls).to.be(1);
				done();
			});
		});
	});
	it( "request weeks", function(done){
		get.get({}, ["geomatikum"], [24], function(){
			get.get({}, ["geomatikum"], [24, 25], function(){
				expect(numberOfCalls).to.be(2);
				done();
			});
		});
	});
});
