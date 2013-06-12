"use strict";
var
  serv = require('..'),
  url = "http://localhost:8080/",
  expect = require('expect.js'),
  request = require('request'),
  fakeweb = require('node-fakeweb');

fakeweb.allowNetConnect = false;
require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/)[1];
	fakeweb.registerUri({uri: item.url.replace("{{week}}", 24).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	fakeweb.registerUri({uri: item.url.replace("{{week}}", 25).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
});

describe('server', function(){

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
			var data = JSON.parse(body);
			var correctMensa = function(item){ return item.mensaId === "geomatikum"; };
			expect( data.menu.every(correctMensa) ).to.be(true);
			checkJSON(data.menu);
			done();
		});
	});

	//~ it( "should not request data multiple time", function(){
		//~ expect(true).to.be(false, "not implemented");
	//~ });

	it( "should handle this, next, both; default is this", function(done){
		// @FIXME: someone need to learn about promises
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
});


//~ describe('legacy server', function(){
	//~ it("should return well formed data", function(done){
		//~ expect(true).to.be(false, "not implemented");
		//~ done();
	//~ });
//~ });

