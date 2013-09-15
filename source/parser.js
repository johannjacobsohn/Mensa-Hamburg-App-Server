/**
 * 
 * @TODO document
 * @TODO cleanup
 * @TODO add parser for wedel
 * 
 */
/*jshint node:true*/
"use strict";
exports.parser = {
	uke    : require("./parser/uke/index.js").parser,
	studhh : require("./parser/uhh/index.js").parser
};
