/** 
 * Static conf file for urls to load data from
 *
 * @class urls
*/
/*jshint node:true*/
"use strict";
(function(){
	var baselink = "http://speiseplan.studierendenwerk-hamburg.de/index.php/de/";
	var urls = {
		mensenWeek : {},
		mensen : [
			{
				name: "Alexanderstrasse",
				id: "alexanderstrasse",
				url:  baselink + "660/2013/{{week}}/",
				address: "Alexanderstra&#195;&#159;e 1, 20099 Hamburg",
				open: "Montag - Donnerstag: 07:45 - 18:00 Uhr, Freitag: 07:45 - 16:00 Uhr",
				misc: "Vom 23.07.2013-07.09.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Armgartstrasse",
				id: "armgartstrasse",
				url:  baselink + "590/2013/{{week}}/",
				address: "Armgartstra&#195;&#159;e 24, 22087 Hamburg",
				open: "Montag - Donnerstag: 09:00 - 15:00 Uhr; Freitag: 09:00 - 14:30 Uhr",
				misc: "Vom 16.07.2013-14.09.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Averhoffstrasse",
				id: "averhoffstrasse",
				url:  baselink + "650/2013/{{week}}/",
				address: "Averhoffstra&#195;&#159;e 38, 22085 Hamburg",
				open: "Montag - Donnerstag: 09:00 - 16:15 Uhr; Freitag: 09:00 - 14:00 Uhr",
				misc: "Vom 16.07.2013-28.09.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Bergedorf",
				id: "bergedorf",
				url:  baselink + "520/2013/{{week}}/",
				address: "Lohbr&#195;&#188;gger Kirchstra&#195;&#159;e 65, 21033 Hamburg",
				open: "Montag - Donnerstag: 11:15 - 15:00 Uhr; Freitag: 11:15 - 14:30 Uhr",
				parser: "studhh"
			},
			{
				name: "Berliner Tor",
				id: "berlinertor",
				url:  baselink + "530/2013/{{week}}/",
				address: "Berliner Tor 7, 20099 Hamburg",
				open: "Montag - Freitag: 11:15 - 14:30 Uhr",
				parser: "studhh"
			},
			{
				name: "Botanischer Garten",
				id: "botanischergarten",
				url:  baselink + "560/2013/{{week}}/",
				address: "Ohnhorstra&#195;&#159;e 18, 22609 Hamburg",
				open: "Montag - Donnerstag: 11:00 - 15:00 Uhr, Freitag: 11:00 - 14:30 Uhr",
				misc: "Vom 16.07.2013-10.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Bucerius Law School",
				id: "buceriuslawschool",
				url:  baselink + "410/2013/{{week}}/",
				address: "Jungiusstra&#195;&#159;e 6, 20355 Hamburg",
				open: "Montag - Freitag: 11:30 - 14:00 Uhr",
				parser: "studhh"
			},
			{
				name: "Campus",
				id: "campus",
				url:  baselink + "340/2013/{{week}}/",
				address: "Von-Melle-Park 5, 20146 Hamburg",
				open: "Montag - Donnerstag: 10:00 - 16:00 Uhr; Freitag: 10:00 - 15:30 Uhr",
				parser: "studhh"
			},
			{
				name: "City Nord",
				id: "citynord",
				url:  baselink + "550/2013/{{week}}/",
				address: "Hebebrandstra&#195;&#159;e 1, 22297 Hamburg",
				open: "Montag - Donnerstag: 08:00 - 15:00 Uhr; Freitag: 08:00 - 14:30 Uhr",
				misc: "Vom 23.07.2013-24.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Finkenau",
				id: "finkenau",
				url:  baselink + "620/2013/{{week}}/",
				address: "Finkenau 35, 22081 Hamburg",
				open: "Montag - Freitag: 08:00 - 18:00 Uhr",
				misc: "Vom 13.08.2013-31.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Geomatikum",
				id: "geomatikum",
				url:  baselink + "540/2013/{{week}}/",
				address: "Bundesstra&#195;&#159;e 55, 20146 Hamburg",
				open: "Montag - Donnerstag: 11:15 - 15:00 Uhr; Freitag: 11:15 - 14:30 Uhr",
				parser: "studhh"
			},
			{
				name: "Harburg",
				id: "harburg",
				url:  baselink + "570/2013/{{week}}/",
				address: "Denickestra&#195;&#159;e 22, 21073 Hamburg",
				open: "Montag - Freitag: 07:45 - 18:00 Uhr",
				parser: "studhh"
			},
			{
				name: "Jungiusstrasse",
				id: "jungiusstrasse",
				url:  baselink + "610/2013/{{week}}/",
				address: "Jungiusstra&#195;&#159;e 9, 20355 Hamburg",
				open: "Montag - Freitag: 10:00- 16:30 Uhr",
				misc: "Vom 16.07.2013-31.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Philosophenturm",
				id: "philosophenturm",
				url:  baselink + "350/2013/{{week}}/",
				address: "Von-Melle-Park 6, 20146 Hamburg",
				open: "Montag - Freitag: 08:00 - 19:00 Uhr, Samstag: 08:00 - 14:30 Uhr",
				misc: "Vom 23.07.2013-25.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Stellingen",
				id: "stellingen",
				url:  baselink + "580/2013/{{week}}/",
				address: "Vogt-K&#195;&#182;lln-Stra&#195;&#159;e 30, 22527 Hamburg",
				open: "Montag - Donnerstag: 08:00 - 15:00 Uhr; Freitag: 08:00 - 14:30 Uhr",
				misc: "Vom 23.07.2013-24.08.2013 geschlossen",
				parser: "studhh"
			},
			{
				name: "Studierendenhaus",
				id: "studierendenhaus",
				url:  baselink + "310/2013/{{week}}/",
				address: "Von-Melle-Park 2, 20146 Hamburg",
				open: "Montag - Donnerstag: 11:00 - 15:00 Uhr, Freitag: 11:00 - 14:30 Uhr",
				parser: "studhh"
			},
			{
				name: "Cafe CFEL",
				id: "cafecfel",
				url: baselink + "/680/2013/{{week}}/",
				address: "Notkestrasse 85, 22607 Hamburg",
				open: "Montag - Freitag: 08:00 - 15:00 Uhr",
				parser: "studhh"
			}
		]
	};
	
	/*
	 * copy urls.mensen into legacy urls.mensenWeek
	 */
	urls.ids = urls.names = {};
	urls.mensen.forEach(function( mensa ){
//		mensa.url = baselink + mensa.name + "/";
		urls.mensenWeek[ mensa.id ] = mensa.url;
		urls[mensa.id] = mensa;
		urls.names[mensa.id] = mensa.name;
		urls.ids[mensa.name] = mensa.id;
//		console.log(urls.names[mensa.id], urls.ids[mensa.name], mensa.id, mensa.name)
	});
	
	exports.urls = urls;
})();
