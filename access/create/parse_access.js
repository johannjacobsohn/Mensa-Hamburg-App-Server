"use strict";
var fs = require("fs"), ua = require("ua-parser");

fs.readFile("access.log", 'utf8', function(err, content) {
	var accessed = {};
	content.split("\\n").forEach(function(line){		var dateMatch = line.match(/\\[(.*)\\]/);
		if( dateMatch ){
			var client = ua.parse(line).family// + " " + ua.parse(line).major;
 			accessed[client] = accessed[client] || [];
			accessed[client].push( +new Date ( dateMatch[1] ) );
		}	});
	console.log( JSON.stringify(accessed) )
});

