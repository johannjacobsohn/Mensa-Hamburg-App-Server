/**
 * Static conf file for urls to load data from
*/
"use strict";
var baselink = "http://speiseplan.studierendenwerk-hamburg.de/index.php/de/";
var year = new Date().getFullYear();
var mensen = [
	{
		name: "Alexanderstrasse",
		id: "alexanderstrasse",
		url: baselink + "660/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Armgartstrasse",
		id: "armgartstrasse",
		url: baselink + "590/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Bergedorf",
		id: "bergedorf",
		url: baselink + "520/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Berliner Tor",
		id: "berlinertor",
		url: baselink + "530/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Botanischer Garten",
		id: "botanischergarten",
		url: baselink + "560/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Bucerius Law School",
		id: "buceriuslawschool",
		url: baselink + "410/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Campus",
		id: "campus",
		url: baselink + "340/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Finkenau",
		id: "finkenau",
		url: baselink + "420/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Geomatikum",
		id: "geomatikum",
		url: baselink + "540/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Harburg",
		id: "harburg",
		url: baselink + "570/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Jungiusstrasse",
		id: "jungiusstrasse",
		url: baselink + "610/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Philosophenturm",
		id: "philosophenturm",
		url: baselink + "350/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Stellingen",
		id: "stellingen",
		url: baselink + "580/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Studierendenhaus",
		id: "studierendenhaus",
		url: baselink + "310/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Cafe CFEL",
		id: "cafecfel",
		url: baselink + "680/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "UKE",
		id: "uke",
		url: "http://www.uke.de/zentrale-dienste/kge/downloads/kge-klinik-gastronomie-eppendorf/ma_kw{{week}}.pdf",
		parser: "uke"
	},
	{
		name: "HCU",
		id: "hcu",
		url: baselink + "430/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "Cafe am Mittelweg",
		id: "cafeammittelweg",
		url: baselink + "690/" + year + "/{{week}}/",
		parser: "studhh"
	},
	{
		name: "empty mensa - just for testing",
		id: "emptymensa",
		url: baselink + "empty/" + year + "/{{week}}/",
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
