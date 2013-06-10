/**
 * handles database interaction and kicks of retriever if data is not yet
 * present or outdated.
 * 
 * re-requests old data as well
 * 
 * @TODO check and rewrite mensen and weeks -&gt; be case insensitive
 * @TODO find out if all mensen are loaded and which are not; retrieved these
 * &lt; 100 lines
 * 
 * @module get.js
 * @exports get
 * 
 */
/*jshint node:true*/
"use strict";
var retrieve = require("./retriever.js").retrieve;
var databaseUrl = "menudb";
var collections = ["menu", "mensen"];
var db = require("mongojs").connect(databaseUrl, collections);
var maxAgeOfData = 1000*60*60*24; //Data should be reloaded at least once a day
var callbackqueue = [];
var locks = {};
var processQueue = function(lock){
	delete locks[lock];
	
	if(!Object.keys(locks).length){
		while (callbackqueue.length){
			(callbackqueue.pop())();
		}
	}
};

var get = function(req, mensen, weeks, since, success){

	//@TODO: handle changedSince
	since = since; // date

	// todo: check and rewrite mensen and weeks
	var requested = [];

	db.menu.find({mensa: { $in: mensen }, week: {$in: weeks }}, function(err, found){
		// find out if all mensen are loaded and which are not; retrieved those
		// check for every requested mensa if it exist in result; if not, request loading
		if(err) {
			console.log(err)
			return
		}
		req.result = found;
		var missingmensen = {};
		mensen.forEach(function(item){
			missingmensen[item] = true;
		});
		found.forEach(function(item){
			delete missingmensen[item.mensa];
		});
		// missingmensen now contains only unsaved mensen
		missingmensen = Object.keys(missingmensen);

		if(missingmensen.length){
			// there are mensen which need to be aquired
			callbackqueue.push(success)
			missingmensen.forEach(function(mensa){
				weeks.forEach(function(week){
					// lock execution of callback queue
					if( !locks[mensa+week] ){
						locks[mensa+week] = true;
						retrieve(mensa, week, function(error, items){
							if(!error){
								items.forEach(function(item){
									db.menu.save(item, function(err){
										if(err) console.error(err)
									});
								});
								req.result.push(items);
							}
							processQueue(mensa+week);
						});
					}
				});
			});
		} else {
			// everything is present, load and call callback
			success(null);
		}
		
		// check for outdated data; trigger reload (this request will get 
		// the old data, but the next one doesn't have to)
		
		

	});
};

exports.get = get;
