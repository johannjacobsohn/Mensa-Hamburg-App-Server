"use strict";
var week = parseInt(process.argv[2], 10);
require("../../../source/parser/uke").parser("ma_kw" + week + ".pdf", "uke", week, function(err, menu){
	console.log( JSON.stringify(menu) );
});
