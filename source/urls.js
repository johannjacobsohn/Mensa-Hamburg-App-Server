/** 
 * Static conf file for urls to load data from
*/
"use strict";
var baselink = "http://speiseplan.studierendenwerk-hamburg.de/index.php/de/";
var mensen = [
	{
		name: "Alexanderstrasse",
		id: "alexanderstrasse",
		url: baselink + "660/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Armgartstrasse",
		id: "armgartstrasse",
		url: baselink + "590/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Averhoffstrasse",
		id: "averhoffstrasse",
		url: baselink + "650/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Bergedorf",
		id: "bergedorf",
		url: baselink + "520/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Berliner Tor",
		id: "berlinertor",
		url: baselink + "530/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Botanischer Garten",
		id: "botanischergarten",
		url: baselink + "560/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Bucerius Law School",
		id: "buceriuslawschool",
		url: baselink + "410/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Campus",
		id: "campus",
		url: baselink + "340/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "City Nord",
		id: "citynord",
		url: baselink + "550/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Finkenau",
		id: "finkenau",
		url: baselink + "620/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Geomatikum",
		id: "geomatikum",
		url: baselink + "540/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Harburg",
		id: "harburg",
		url: baselink + "570/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Jungiusstrasse",
		id: "jungiusstrasse",
		url: baselink + "610/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Philosophenturm",
		id: "philosophenturm",
		url: baselink + "350/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Stellingen",
		id: "stellingen",
		url: baselink + "580/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Studierendenhaus",
		id: "studierendenhaus",
		url: baselink + "310/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Cafe CFEL",
		id: "cafecfel",
		url: baselink + "680/2013/{{week}}/",
		parser: "studhh"
	},
	{
		name: "UKE",
		id: "uke",
		url: "http://www.uke.de/zentrale-dienste/kge/downloads/kge-klinik-gastronomie-eppendorf/ma_kw{{week}}.pdf",
		parser: "uke"
	},
	{
		name: "empty mensa - just for testing",
		id: "emptymensa",
		url: baselink + "empty/2013/{{week}}/",
		parser: "studhh"
	}
];

/*
 * create helpers
 */
var byName = {}, byId = {};
mensen.forEach(function( m ){
	byName[m.name] = byId[m.id] = m;
});

exports.list = mensen;
exports.byName = byName;
exports.byId = byId;
