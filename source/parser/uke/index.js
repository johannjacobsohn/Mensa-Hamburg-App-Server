//~
//~
//~ Target: 150 Lines
//~ @TODO: split and rejoin "süßer Abschluss" and "Beilagen & Gemüse" by ,
//~ 
"use strict";
var exec = require('child_process').exec;

function trim(item){
	return item.replace(/[\s]+/g, " ").trim();
}

function parser(file, mensaId, week, callback){
	var names = [];
	exec('pdftotext -q -layout ' + file + " - ", function (error, stdout, stderr){
		var s = stdout.split("\n"), menu = [], rows = [];

		var header;

		// remove header
		for(var i = 0; i<s.length; i++){
			if( s[i].search(/Montag.*Dienstag/) !== -1 ){
				header = s[i];
				s[i] = null;
				break;
			}
			s[i] = null;
		}
		s = s.filter(function(item){
			return item != null;
		})

		// remove footer
		var footer = s.splice(-3,2).join("");
		var additivesList = extractAdditives(footer);

		// split columns
		var horBounds = getBoundaries(header);
		//~ console.log(header)
		var s = getColums(s, horBounds);

		// first column == names; tread separately
		var names = s.shift().map(trim).join("\n").split(/[\n]{3,}/g).map(trim);
		var veggi = names.indexOf("Vegetarisch");
		if(veggi == -1) veggi = names.indexOf("vegetarisch");
		names.splice(veggi, 1);
		names[ veggi - 1 ] += " - Vegetarisch"
		//~ console.log(names)

		// last column == additional information; ignore.
		//~ s.pop();
//~ console.log(s[4])
		// split rows
		for(var x = 0; x < s.length; x++){
			rows = splitRows(s[x], names);
			for(var y = 0; y < rows.length; y++){
				menu.push( parse(rows[y], x, names[y] || "", week, additivesList) );
			}
		}

		callback(null, menu);
	});
}

function extractAdditives(str){
	var v = [],
		re = /[0-9]+ ([^,]*),/g,
		match;
	while (match = re.exec(str)) {
		v.push(match[1]);
	}
	return v;
}


function findAdditives(str){
	var v = [],
		re = /\(([0-9]+)\),/g,
		match;
	while (match = re.exec(str)) {
		v.push(parseInt(match[1]));
	}
	return v;
}

//~ There are three markers which mark vertical boundaries:
//~ above "Pasta Bar"
//~ below "Kcal"
//~ below "€", except when followed by "Kcal"
function splitRows(column, types){
	var found = [];

	column = column.filter(function(item){ return item.match(/[\w]/) });
	column.forEach(function(line, lineNo, array){
			if(line.match(/Pasta Bar/i)){
				found.push(lineNo);
			} else if( line.match(/Kcal/i) ){
				found.push(lineNo+1);
			} else if( line.match(/€/) && array[lineNo+1] && !array[lineNo+1].match(/Kcal/i) ){
				found.push(lineNo+1);
			}
		})
	;

	var bug = types.indexOf("Beilagen & Gemüse")
	//~ console.log(found, types.indexOf("Beilagen & Gemüse"), found[bug] + 3 )

	// Beilagen & Gemüse ist genau drei Zeilen lang
	found.push(found[bug-1] + 3);

	found.push(column.length);

	found = found.sort(function(a,b){return a-b});
	//~ console.log(found)

	found = found
		.map(function(item, i, arr){
			return column.slice(arr[i-1] || 0, item).join("\n");
		})
		.map(trim)
	;

	return found;
}

//~ function getBoundaries(s){
	//~ var str = s.map(function(line){
		//~ var a = line.split("").map(function(char){
			//~ return +(char !== " " && !!char);
		//~ })
		//~ return a
	//~ })
	//~ .reduce(function(prev, line){
		//~ var a = (prev.length > line.length ? prev : line);
//~ 
		//~ a = a.map(function(char, i){
			//~ return !!line[i] + Math.min(prev[i] || 0, 8);
		//~ });
		//~ return a;
	//~ })
	//~ // einmal ist keinmal
	//~ .map(function(i){
		//~ return i < 3 ? 0 : i;
	//~ })
	//~ .join("");
//~ 
	//~ var v = [],
		//~ re = /0{2,}/g,
		//~ match;
	//~ while (match = re.exec(str)) {
		//~ console.log(match.index, Math.floor(match[0].length/2))
		//~ v.push(match.index + Math.floor(match[0].length/2));
	//~ }
	//~ return v;
//~ }

// -------------#####--------#####--------#####-------#####--------######-------------------
//      [^]             ^             ^           ^            ^              [^]
function getBoundaries(line){
	var markers = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
	markers.pop();

	markers = markers.map(function(mark){
		var re = new RegExp(mark + "([\\s]+)");
		//~ console.log(re, line)
		var match = re.exec(line);
		return match.index + Math.floor( mark.length + match[1].length/2 );
		//~ return Math.floor( mark.length + match[1].length/2 );
	});

	//~ var average = markers.reduce(function(a, b){ return a + b; })/markers.length;

	var meanDistance = (markers[markers.length-1] - markers[0])/(markers.length-1);
//~ console.log(meanDistance)
	markers.push(Math.floor(markers[markers.length-1] + meanDistance));
	markers.unshift(Math.floor(markers[0] - meanDistance));
//~ console.log(markers)
	return markers;
}

//~ TODO: document; cleanup
function getColums(s, v){
	var c = [[], [], [], [], [], []];
	var orig_v = JSON.stringify(v);
	s.forEach(function(line){
		var x, left, right;

		// reset v
		v = JSON.parse(orig_v);

		for(var i = 0; i<c.length; i++){
			//~ console.log(line[v[i]])
			if(line && line[v[i]] && line[v[i]] !== " "){


				// first, look for unusual long whitespace within current string
				var whitemarker = line.substring(v[i-1] || 0, v[i]).match(/[^\s][\s]{2,}/);
				//~ console.log(whitemarker)

				if(whitemarker){
					x = v[i];
					v[i] = v[i-1] + whitemarker.index + 1;
					//~ console.log("set to", x, v[i-1], whitemarker.index, v[i], line.substring(v[i-1] || 0, v[i]), line.substring(v[i-1] || 0, x) )
				} else {
					//~ v[i] = v[i]-1;
					x = left = right = v[i];
					//~ console.log(line[v[i]])
					while(true){
						left--;
						right++;
						if(!left || !line[left] || line[left] === " "){
							v[i] = left;
							//~ console.log("left resolved at: ...", ""+line[left]+line[left+1]+line[left+2]+line[left+3], line.substring(v[i-1] || 0, v[i]).trim(), line[x] )
							break;
						} else if(!line[right] || line[right] === " "){
							v[i] = right;
							//~ console.log("right resolved at: ...", ""+line[right-3]+line[right-2]+line[right-1]+line[right], line.substring(v[i-1] || 0, v[i]).trim(), line[x])
							break;
						}
						//~ console.log("line not complete:", line[left], line[right], left, right)
					}
				}
			}
			c[i].push( line.substring(v[i-1] || 0, v[i]) );
		}
	});

	return c;
}

//~ parse entry
function parse(entry, x, y, week, additivesList){
	var a = entry.match(/€(.{3,6})/i) || entry.match(/(-,.{2})/i);
	var price = a && a.length ? a[1] : "0,00";

	price = parseFloat( price.replace(/-./, "0.").replace(",", ".") );
	var kcal = parseInt( entry.match(/([0-9]+) Kcal/i) );

	var date = new Date(new Date().getFullYear(), 0, (week-1)*7 + x);
	var dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();

	var dish = entry;

	var additives = findAdditives(dish).map(function(idx){
		return additivesList[idx];
	});

	dish = dish
		.replace(/€.*/, "")
		.replace(/-,.{2}/, "")
		.replace(/\([0-9]+\)/g, " ")
		.replace(/[\s]+/g, " ")
		.replace(/ ,/g, ",")
		.trim()
	;

	return {
		studPrice   : price,
		normalPrice : price,
		name        : dish,
		mensaId     : "uke",
		week        : week,
		type        : y,
		date        : dateString,
		kcal        : kcal || null,
		properties  : [],
		additives   : additives
	};
}

exports.parser = parser;
