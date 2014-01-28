"use strict";

var
  expect  = require('expect.js'),
  parser = require("../source/parser/uke/index.js").parser,
  fs = require('fs'),
  year = new Date().getFullYear();

function sort(a, b){
	a = a.name + a.type;
	b = b.name + b.type;
	return a === b ? 0 : (a > b ? 1 : -1);
}

describe('uke parser', function(){
	//~ [30, 32, 33, 34, 35, 36, 37]
	[37, 38, 39, 40, 41].forEach(function(week){
		it("works for kw" + week, function(done){
			fs.readFile("test/fixtures/uke/ma_kw" + week + ".json", 'utf8', function(err, data) {
				var fixture = JSON.parse(data);

				parser("test/fixtures/uke/ma_kw" + week + ".pdf", "uke", week, function(err, data){
					data = data.sort(sort);

					fixture.sort(sort).forEach(function(item, i){
						// normalize date for comparison
						data[i].date = new Date(data[i].date).toISOString();

						expect(item).to.eql(data[i]);
					});
					expect(data.length).to.be(fixture.length);

					done();
				});
			});
		});
	});

});
