"use strict";

var
  url     = "http://localhost:8081/",
  expect  = require("expect.js"),
  request = require("request"),
  fakeweb = require("node-fakeweb"),
  serv    = require(".."),
  fs      = require("fs"),
  async   = require("async"),
  getWeek = require("../source/getweek.js"),
  now     = new Date(),
  toDoubleDigit = function(number){
      var n = "" + number;
      return n.length === 1 ? "0" + n : n;
  },
  thisWeekNumber = toDoubleDigit( getWeek(now) ),
  nextWeekNumber = toDoubleDigit( getWeek( new Date( +now + 7 * 24 * 3600 * 1000 )) );

fakeweb.allowNetConnect = false;



require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/);
	if(id){
		id = id[1];
		fakeweb.registerUri({uri: item.url.replace("{{week}}", thisWeekNumber).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
		fakeweb.registerUri({uri: item.url.replace("{{week}}", nextWeekNumber).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	}
});


var sort = function(a,b){
	return a.date + a.name > b.date + b.name ? 1 : -1;
};

describe('server', function(){
	var geomatikum;

	var checkJSON = function(menu){
		var hasProperties = function(item){ return item.properties; };
		var hasAdditives  = function(item){ return item.additives; };
		var hasName  = function(item){ return item.name; };
		var isMinified  = function(item){ return !item._id && !item.__v && !item.week; };
		var hasPrice = function(item){ return item.studPrice && item.normalPrice; };
		expect( menu ).to.not.be.empty();
		expect( menu.every(hasProperties) ).to.be(true);
		expect( menu.every(hasAdditives)  ).to.be(true);
		expect( menu.every(hasName)       ).to.be(true);
		expect( menu.every(hasPrice)      ).to.be(true);
		expect( menu.every(isMinified)    ).to.be(true);
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
			expect(both).to.not.be.empty();
			expect(thisw).to.not.be.empty();
			expect(next).to.not.be.empty();
			expect(thisw).to.eql(withoutSlash);
			expect(thisw).to.eql(withSlash);
			var jsonthis = (JSON.parse(thisw)).menu;
			var jsonnext = (JSON.parse(next)).menu;
			var jsonthisnext = (JSON.parse(thisnext)).menu.sort(sort);
			var jsonnextthis = (JSON.parse(nextthis)).menu.sort(sort);
			var jsonboth = (JSON.parse(both)).menu.sort(sort);
			var combined = jsonthis.concat(jsonnext).sort(sort);

			expect( jsonboth ).to.eql( jsonthisnext );
			expect( jsonboth ).to.eql( jsonnextthis );
			expect( jsonboth ).to.eql( combined );

			done();
		});
	});

	it( "should handle this weeks number", function(done){
		request(url + "geomatikum/"+ getWeek(), function(err, res, body){
			var a = body;
			request(url + "geomatikum/this", function(err, res, body){
				expect(a).to.be(body);
				done();
			});
		});
	});

	it( "should handle the next week number", function(done){
		request(url + "geomatikum/"+ getWeek(new Date(+new Date() + 7 * 24 * 3600 * 1000)), function(err, res, body){
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
		var file = "logs/access.log";

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
					combined = campus.concat(geo).sort(sort);
					geocampus = JSON.parse(body).menu.sort(sort);
					checkJSON(geocampus);
					expect( geocampus ).to.eql( combined );
					done();
				});
			});
		});
	});

	it( "should allow CORS requests", function(done){
		request(url + "Geomatikum/", function(err, res, body){
			expect( res.headers['Access-Control-Allow-Origin'.toLowerCase()] ).to.be('*');
			done();
		});
	});

	it( "accept CORS preflight requests", function(done){
		request({url: url + "Geomatikum/", method: "OPTIONS"}, function(err, res, body){
			expect( res.headers['Access-Control-Allow-Origin'.toLowerCase()] ).to.be('*');
			expect(body).to.be("OK");
			done();
		});
	});
});
