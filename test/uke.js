"use strict";

var
  expect  = require('expect.js'),
  parser = require("../source/parser/uke/index.js").parser,
  fs = require('fs');

function sort(a, b){
	a = a.date + a.name + a.type;
	b = b.date + b.name + b.type;
	return a === b ? 0 : (a > b ? 1 : -1);
}

describe.only('uke parser', function(){
	this.timeout(5 * 60 * 1000);

	//~ [30, 32, 33, 34, 35, 36, 37]

	[37, 39].forEach(function(week){
		it("works for kw" + week, function(done){
			fs.readFile("test/fixtures/uke/" + week + ".json", 'utf8', function(err, data) {
				var fixture = JSON.parse(data);

				parser("test/fixtures/uke/" + week + ".pdf", "uke", week, function(err, data){
					data = data
						//~ .map(function(item){
							//~ item.type = !item.type ? "" : item.type;
							//~ return item;
						//~ })
						.sort(sort);

					fixture.sort(sort).forEach(function(item, i){
						expect(item).to.eql(data[i]);
					});
					expect(data.length).to.be(fixture.length);

					done();
				});
			});
		});
	});

});
