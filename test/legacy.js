"use strict";

var
  url     = "http://localhost-legacy:8081/",
  expect  = require('expect.js'),
  request = require('request'),
  fakeweb = require('node-fakeweb'),
  getWeek = require("../source/getweek.js"),
  serv    = require('..');

var now = new Date();
var thisWeek = getWeek(now);
var nextWeek = getWeek( new Date( +now + 7 * 24 * 3600 * 1000 ));

fakeweb.allowNetConnect = false;
fakeweb.ignoreUri({uri: url + "Geomatikum"});
fakeweb.ignoreUri({uri: url + "Geomatikum/" + thisWeek});
fakeweb.ignoreUri({uri: url + "Geomatikum/" + nextWeek});

require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/);
	if(id){
		id = id[1];
		fakeweb.registerUri({uri: item.url.replace("{{week}}", thisWeek).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
		fakeweb.registerUri({uri: item.url.replace("{{week}}", nextWeek).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	}
});

var checkJSON = function(menu){
	var hasProperties = function(item){ return item.properties; };
	var hasAdditives  = function(item){ return item.additives; };
	var hasName  = function(item){ return item.name; };
	var hasPrice = function(item){ return item.studPrice && item.normalPrice; };
	expect( menu ).to.not.be.empty();
	expect( menu.every(hasProperties) ).to.be(true);
	expect( menu.every(hasAdditives)  ).to.be(true);
	expect( menu.every(hasName)       ).to.be(true);
	expect( menu.every(hasPrice)      ).to.be(true);
};

describe('legacy server', function(){
	var thisWeekGeomatikum;
	it("should return well formed data", function(done){
		request(url + "Geomatikum", function(err, res, body){
			var menu = JSON.parse(body);
			thisWeekGeomatikum = menu;
			expect(menu).to.be.an("array");
			expect(menu).to.have.length(14);
			checkJSON(menu);


			expect( menu.every(function(i){ return getWeek( new Date(i.date) ) === thisWeek; }) ).to.be(true);
			done();
		});
	});
	it("should accept week numbers: this week", function(done){
		request(url + "Geomatikum/" + thisWeek, function(err, res, body){
			var menu = JSON.parse(body);
			expect( menu.every(function(i){ return getWeek( new Date(i.date) ) === thisWeek; }) ).to.be(true);

			var sort = function(a,b){
				var left = a.date + a.name + a.mensaId,
					right = b.date + b.name + b.mensaId;
				return left === right ? 0 : left > right ? 1 : -1;
			};
			expect( thisWeekGeomatikum.sort(sort) ).to.eql( menu.sort(sort) );
			done();
		});
	});
	it("should accept week numbers: next week", function(done){
		request(url + "Geomatikum/" + nextWeek, function(err, res, body){
			var menu = JSON.parse(body);
			expect( menu.every(function(i){ return getWeek( new Date(i.date) ) === nextWeek; }) ).to.be(true);
			done();
		});
	});
});
