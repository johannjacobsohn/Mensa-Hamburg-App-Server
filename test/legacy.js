"use strict";

var
  url     = "http://localhost-legacy:8080/",
  expect  = require('expect.js'),
  request = require('request'),
  fakeweb = require('node-fakeweb'),
  serv    = require('..');

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

var now = new Date();
var thisWeek = now.getWeek();
var nextWeek = new Date( +now + 7 * 24 * 3600 * 1000 ).getWeek();

fakeweb.allowNetConnect = false;
fakeweb.ignoreUri({uri: url + "Geomatikum"});
fakeweb.ignoreUri({uri: url + "Geomatikum/" + thisWeek});
fakeweb.ignoreUri({uri: url + "Geomatikum/" + nextWeek});

require("../source/urls.js").list.forEach(function(item){
	var id = item.url.match(/\/de\/(.*)\/201/);
	if(id){
		id = id[1];
		fakeweb.registerUri({uri: item.url.replace("{{week}}", 24).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
		fakeweb.registerUri({uri: item.url.replace("{{week}}", 25).replace(".de", ".de:80"), file: 'test/fixtures/'+id});
	}
});

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

describe('legacy server', function(){
	var thisWeekGeomatikum;
	it("should return well formed data", function(done){
		request(url + "Geomatikum", function(err, res, body){
			var menu = JSON.parse(body);
			thisWeekGeomatikum = menu;
			expect(menu).to.be.an("array");
			expect(menu).to.have.length(14);
			checkJSON(menu);

			expect( menu.every(function(i){ return i.week === thisWeek; }) ).to.be(true);
			done();
		});
	});
	it("should accept week numbers: this week", function(done){
		request(url + "Geomatikum/"+thisWeek, function(err, res, body){
			var menu = JSON.parse(body);
			expect( menu.every(function(i){ return i.week === thisWeek; }) ).to.be(true);

			var sort = function(a,b){ return a._id === b._id ? 0 : a._id > b._id ? 1 : -1; };
			expect( thisWeekGeomatikum.sort(sort) ).to.eql( menu.sort(sort) );
			done();
		});
	});
	it("should accept week numbers: next week", function(done){
		request(url + "Geomatikum/"+nextWeek, function(err, res, body){
			var menu = JSON.parse(body);
			expect( menu.every(function(i){ return i.week === nextWeek; }) ).to.be(true);
			done();
		});
	});
});
