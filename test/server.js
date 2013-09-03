"use strict";

var
  url     = "http://localhost:8080/",
  expect  = require('expect.js'),
  request = require('request'),
  fakeweb = require('node-fakeweb'),
  mockery = require("mockery"),
  serv    = require('..');

fakeweb.allowNetConnect = false;
require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/)[1];

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

	fakeweb.registerUri({uri: item.url.replace("{{week}}", new Date().getWeek()).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	fakeweb.registerUri({uri: item.url.replace("{{week}}", new Date().getWeek()+1).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
});

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
		// @FIXME: someone needs to learn about promises
		request(url + "Geomatikum/", function(err, res, body){
			var withSlash = body;
			request(url + "Geomatikum", function(err, res, body){
				var withoutSlash = body;
				request(url + "Geomatikum/this", function(err, res, body){
					var thisw = body;
					request(url + "Geomatikum/next", function(err, res, body){
						var next= body;
						request(url + "Geomatikum/this,next", function(err, res, body){
							var thisnext = body;
							request(url + "Geomatikum/next,this", function(err, res, body){
								var nextthis = body;
								request(url + "Geomatikum/both", function(err, res, body){
									var both = body;
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
						});
					});
				});
			});
		});
	});

	//~ it( "should handle week numbers", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

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

	//~ it( "should fail gracefully", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	//~ it( "should log errors", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	//~ it( "should log accessed", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	//~ it( "should honour changedSince", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	//~ it( "should compress data", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

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
		get.get({}, ["geomatikum"], [24], "", function(){});
		get.get({}, ["geomatikum"], [24], "", function(){});

		// make sure retriever has been called just once
		setTimeout(function(){
			expect(numberOfCalls).to.be(1);
			done();
			mockery.deregisterAll();
		}, 30);
	});
});
