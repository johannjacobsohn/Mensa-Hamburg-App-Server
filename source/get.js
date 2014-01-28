/**
 * handles database interaction and kicks of retriever if data is not yet
 * present or outdated.
 *
 * re-requests old data as well
 *
 *
 * @module get.js
 * @exports get
 */
"use strict";

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/mensaDB");
var retrieve = require("./retriever.js");
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
	createdAt   : { type: Date, expires: "3h" }, // let menu expire after 3 hours
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

var get = function(req, mensen, weeks, callback){
	var requested = [];
	Dish.find({mensaId: { $in: mensen }, week: {$in: weeks }}, function(err, found){
		// find out if all mensen are loaded and which are not; retrieved those
		// check for every requested mensa if it exist in result; if not, request loading
		if(err) {
			console.log(err);
			return;
		}

		req.result = found;
		var missing = {};
		mensen.forEach(function(mensa){
			missing[mensa] = {};
			weeks.forEach(function(week){
				missing[mensa][week] = true;
			});
		});
		found.forEach(function(item){
			if( missing[item.mensaId] && missing[item.mensaId][item.week]){
				delete missing[item.mensaId][item.week];
				if( !Object.keys(missing[item.mensaId]).length ){
					delete missing[item.mensaId];
				}
			}
		});
		// missingmensen now contains only unsaved mensen
		var missingmensen = Object.keys(missing);
		if(missingmensen.length){
			// there are mensen which need to be aquired
			callbackqueue.push(callback);
			missingmensen.forEach(function(mensa){
				Object.keys(missing[mensa]).forEach(function(week){
					// lock execution of callback queue
					if( !locks[mensa+week] ){
						locks[mensa+week] = true;

						retrieve(mensa, week, function(err, items){
							if(err){
								processQueue(err, mensa+week);
							} else {
								var counter = items.length;
								if(counter){
									items.forEach(function(item){
										item.createdAt = new Date();
										item.week = week;
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
								} else {
									process.nextTick( processQueue.bind(this, null, mensa+week) );
								}
							}
						});
					}
				});
			});
		} else {
			// everything is present, load and call callback
			process.nextTick(callback);
		}
	}).lean();
};

exports.clean = function(done){
	Dish.collection.remove(done || function(){});
};

exports.get = get;
