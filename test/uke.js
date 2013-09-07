"use strict";

var
  expect  = require('expect.js'),
  request = require('request'),
  parser = require("../source/parser/uke/index.js").parser,
  fs = require('fs')

function sort(a, b){
	if( a.date + a.name + a.type === b.date + b.name + b.type ) return 0;
	return (a.date + a.name + a.type > b.date + b.name + b.type) ? 1 : -1;
}

describe('uke parser', function(){
	this.timeout(5 * 60 * 1000);

//~ [30, 32, 33, 34, 35, 36, 37]

	[37].forEach(function(week){
		it("works for kw" + week, function(done){
			fs.readFile("test/fixtures/uke/" + week + ".json", 'utf8', function(err, data) {
				var fix = JSON.parse(data);
				parser("test/fixtures/uke/" + week + ".pdf", "uke", week, function(err, data){
					data = data.map(function(item){
						item.type = !item.type ? "" : item.type;
						return item;
					});

					data = data.sort(sort);
					fix = fix.sort(sort);

					//~ console.log(JSON.stringify(data))

					expect(data).to.eql(fix);

					done();
				});
			});
		});
	});

});
