"use strict";

// https://gist.github.com/2344435
module.exports = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID");
	// intercept OPTIONS method
	if ("OPTIONS" === req.method.toUpperCase()) {
		res.send(200);
	} else {
		next();
	}
};
