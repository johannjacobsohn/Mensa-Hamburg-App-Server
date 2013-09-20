"use strict";

var
  url     = "http://localhost:8080/",
  expect  = require("expect.js"),
  request = require("request"),
  fakeweb = require("node-fakeweb"),
  mockery = require("mockery"),
  serv    = require(".."),
  fs      = require("fs"),
  async   = require('async'),
  thisWeekNumber = new Date().getWeek(),
  nextWeekNumber = thisWeekNumber + 1;

fakeweb.allowNetConnect = false;
require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/)[1];
	fakeweb.registerUri({uri: item.url.replace("{{week}}", thisWeekNumber).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	fakeweb.registerUri({uri: item.url.replace("{{week}}", nextWeekNumber).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
});

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

describe('server', function(){
	var geomatikum;

	var checkJSON = function(menu){
		var hasProperties = function(item){ return item.properties; };
		var hasAdditives  = function(item){ return item.additives; };
		var hasWeek  = function(item){ return item.week; };
		var hasName  = function(item){ return item.name; };
		var hasPrice = function(item){ return item.studPrice && item.normalPrice; };
		expect( menu ).to.not.be.empty();
		expect( menu.every(hasProperties) ).to.be(true);
		expect( menu.every(hasAdditives)  ).to.be(true);
		expect( menu.every(hasWeek)       ).to.be(true);
		expect( menu.every(hasName)       ).to.be(true);
		expect( menu.every(hasPrice)      ).to.be(true);
	};

	it("should return well formed data", function(done){
		request(url + "Geomatikum", function(err, res, body){
			geomatikum = JSON.parse(body);
			var correctMensa = function(item){ return item.mensaId === "geomatikum"; };
			expect( geomatikum.menu.every(correctMensa) ).to.be(true);
			checkJSON(geomatikum.menu);
			done();
		});
	});

	it("clears out unparsable mensen", function(done){
		request(url + "Geomatikum,DOESNOTEXIST", function(err, res, body){
			var sort = function(a,b){ return a._id === b._id ? 0 : a._id > b._id ? 1 : -1; };
			expect( JSON.parse(body).menu.sort(sort) ).to.eql( geomatikum.menu.sort(sort) );
			done();
		});
	});

	it( "should handle this, next, both; default is this", function(done){
		var withSlash, withoutSlash, thisw, next, thisnext, nextthis, both;
		async.series([
			function(callback){
				request(url + "Geomatikum/", function(err, res, body){
					withSlash = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum", function(err, res, body){
					withoutSlash = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum/this", function(err, res, body){
					thisw = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum/next", function(err, res, body){
					next = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum/this,next", function(err, res, body){
					thisnext = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum/next,this", function(err, res, body){
					nextthis = body;
					callback();
				});
			},
			function(callback){
				request(url + "Geomatikum/both", function(err, res, body){
					both = body;
					callback();
				});
			}
		], function(){

			var sort_by_id = function(a,b){
				return a._id>b._id ? 1 : -1;
			};
			expect(both).to.eql(thisnext);
			expect(both).to.eql(nextthis);
			expect(both).to.not.be.empty();
			expect(thisw).to.not.be.empty();
			expect(next).to.not.be.empty();
			expect(thisw).to.eql(withoutSlash);
			expect(thisw).to.eql(withSlash);
			var jsonthis = (JSON.parse(thisw)).menu;
			var jsonnext = (JSON.parse(next)).menu;
			var jsonboth = (JSON.parse(both)).menu;
			var combined = jsonthis.concat(jsonnext);

			expect( jsonboth.sort(sort_by_id) ).to.eql( combined.sort(sort_by_id) );

			done();
		});
	});

	it( "should handle this weeks number", function(done){
		request(url + "geomatikum/"+ thisWeekNumber, function(err, res, body){
			var a = body;
			request(url + "geomatikum/this", function(err, res, body){
				expect(a).to.be(body);
				done();
			});
		});
	});

	it( "should handle the next week number", function(done){
		request(url + "geomatikum/"+ nextWeekNumber, function(err, res, body){
			var a = body;
			request(url + "geomatikum/next", function(err, res, body){
				expect(a).to.be(body);
				done();
			});
		});
	});

	it( "should be case insensitive", function(done){
		request(url + "geomAtikum,philosophenturm,STUDIERENDENHAUS", function(err, res, body){
			var data = JSON.parse(body);
			var hasMensa = function(mensa, menu){
				return menu.some(function(item){ return item.mensaId === mensa; });
			};
			checkJSON(data.menu);
			expect( hasMensa("geomatikum",       data.menu) ).to.be(true);
			expect( hasMensa("philosophenturm",  data.menu) ).to.be(true);
			expect( hasMensa("studierendenhaus", data.menu) ).to.be(true);
			done();
		});
	});

	it( "should handle unexpected urls gracefully", function(done){
		request(url + "test", function(err, res, body){
			expect( res.headers['content-type'] ).to.be('application/json; charset=utf-8');
			expect( res.statusCode ).to.be(200);

			var j = JSON.parse(body);
			expect( j ).to.be.an("object");
			expect( j.menu ).to.be.an("array");
			expect( j.menu ).to.be.empty();
			done();
		});
	});

	//~ it( "should log errors", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	it( "should log accessed", function(done){
		var file = "access.log";

		async.series([
			// empty log file
			fs.writeFile.bind(fs, file, ""),

			// confirm log file is empty
			function(callback){
				fs.readFile(file, function(err, content){
					expect(content).to.be.empty();
					callback();
				});
			},

			// make request to server
			request.bind(this, url + "geomatikum/"),

			// confirm log file is not empty anymore
			function(callback){
				fs.readFile(file, "", function(err, content){
					expect(content).to.not.be.empty();
					callback();
				});
			}
		], function(err) {
			done();
		});
	});

	it("should compress output", function(done){
		var headers = {
			'Accept-Encoding': 'gzip'
		};

		request({url: url + "Geomatikum/", 'headers': headers}, function(err, res, body){
			expect( res.headers['content-encoding'] ).to.be('gzip');
			done();
		});
	});

	it("an empty mensa yields an empty result", function(done){
		request({url: url + "emptymensa/"}, function(err, res, body){
			expect( res.headers['content-type'] ).to.be('application/json; charset=utf-8');
			expect( res.statusCode ).to.be(200);
			expect( JSON.parse(body).menu ).to.be.empty();
			done();
		});
	});


	it( "should allow for mensen to be combined", function(done){
		var geo, campus, geocampus, combined;
		request(url + "Geomatikum/", function(err, res, body){
			geo = JSON.parse(body).menu;
			request(url + "Campus/", function(err, res, body){
				campus = JSON.parse(body).menu;
				checkJSON(campus);
				request(url + "Geomatikum,Campus/", function(err, res, body){
					var sort_by_id = function(a,b){
						return a._id>b._id ? 1 : -1;
					};
					combined = campus.concat(geo).sort(sort_by_id);
					geocampus = JSON.parse(body).menu.sort(sort_by_id);
					checkJSON(geocampus);
					expect( geocampus ).to.eql( combined );
					done();
				});
			});
		});
	});

	it( "should not request data multiple time", function(done){
		// mock retriever
		var numberOfCalls = 0;
		mockery.enable({ useCleanCache: true });
		mockery.warnOnUnregistered(false);
		mockery.registerMock('./retriever.js', {
			retrieve: function(mensa, week, callback){
				numberOfCalls++;
				setTimeout(function(){
					callback([{name:"testdish"}]);
				}, 10);
			}
		});

		// request data twice
		var get = require("../source/get.js");
		get.clean(); // drop database
		get.get({}, ["geomatikum"], [24], function(){});
		get.get({}, ["geomatikum"], [24], function(){});

		// make sure retriever has been called just once
		setTimeout(function(){
			expect(numberOfCalls).to.be(1);
			done();
			mockery.deregisterAll();
		}, 30);
	});
});
