/**
 * handles database interaction and kicks of retriever if data is not yet
 * present or outdated.
 * 
 * re-requests old data as well
 * 
 * @TODO check and rewrite mensen and weeks -> be case insensitive
 * 
 * @module get.js
 * @exports get
 */
"use strict";

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mensaDB');
var retrieve = require("./retriever.js").retrieve;
var maxAgeOfData = 1000*60*60*24; // Data should be reloaded at least once a day
var callbackqueue = [];
var locks = {};
var processQueue = function(err, lock){
	delete locks[lock];

	if(!Object.keys(locks).length){
		while (callbackqueue.length){
			(callbackqueue.pop())(err);
		}
	}
};

var dishSchema = mongoose.Schema({
	mensaId     : String,
	week        : Number,
	name        : String,
	type        : String,
	studPrice   : Number,
	normalPrice : Number,
	date        : Date,
	properties  : [String],
	additives   : [String]
});

var Dish = mongoose.model('Dish', dishSchema);

var get = function(req, mensen, weeks, since, callback){
	// @TODO: handle changedSince

	// @TODO: wont work for mensa+week combination

	// todo: check and rewrite mensen and weeks
	var requested = [];
	Dish.find({mensaId: { $in: mensen }, week: {$in: weeks }}, function(err, found){
		// find out if all mensen are loaded and which are not; retrieved those
		// check for every requested mensa if it exist in result; if not, request loading
		if(err) {
			console.log(err);
			return;
		}

		req.result = found;
		var missingmensen = {};
		mensen.forEach(function(item){
			missingmensen[item] = true;
		});
		found.forEach(function(item){
			delete missingmensen[item.mensaId];
		});
		// missingmensen now contains only unsaved mensen
		missingmensen = Object.keys(missingmensen);

		if(missingmensen.length){
			// there are mensen which need to be aquired
			callbackqueue.push(callback);
			missingmensen.forEach(function(mensa){
				weeks.forEach(function(week){
					// lock execution of callback queue
					if( !locks[mensa+week] ){
						locks[mensa+week] = true;
						retrieve(mensa, week, function(err, items){
							if(err){
								processQueue(err, mensa+week);
							} else {
								var counter = items.length;
								items.forEach(function(item){
									new Dish(item).save(function(err, dish){
										if(err){
											console.error(err);
										} else {
											req.result.push(dish);
										}
										if(!--counter){
											processQueue(null, mensa+week);
										}
									});
								});
							}
						});
					}
				});
			});
		} else {
			// everything is present, load and call callback
			callback();
		}

		// @TODO:
		// check for outdated data; trigger reload (this request will get 
		// the old data, but the next one doesn't have to)

	});
};

exports.get = get;
