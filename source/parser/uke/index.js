"use strict";
var exec = require('child_process').exec;

function trim(item){
	return item.replace(/[\s]+/g, " ").trim();
}

function findAll(str, regexp){
	var v = [], match;
	while(!!(match = regexp.exec(str))) {
		v.push(match[1]);
	}
	return v;
}

function extractAdditives(str){
	return findAll(str, /[0-9]+ ([^,]*),/g);
}

function findAdditives(str){
	return findAll(str, /\(([0-9]+)\),/g);
}

//~ There are three markers which mark vertical boundaries:
//~ above "Pasta Bar"
//~ below "Kcal"
//~ below "€", except when followed by "Kcal"
function splitRows(column, types){
	var found = [];

	column = column.filter(function(item){ return item.match(/[\w]/); });
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

	// Beilagen & Gemüse ist genau drei Zeilen lang
	var bug = types.indexOf("Beilagen & Gemüse");
	found.push(found[bug-1] + 3);
	found.push(column.length);
	found = found.sort(function(a,b){return a - b; });

	found = found
		.map(function(item, i, arr){
			return column.slice(arr[i-1] || 0, item).join("\n");
		})
		.map(trim)
	;

	return found;
}

// -------------#####--------#####--------#####-------#####--------######-------------------
//      [^]             ^             ^           ^            ^              [^]
function getBoundaries(line){
	var markers = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
	markers.pop();

	markers = markers.map(function(mark){
		var re = new RegExp(mark + "([\\s]+)");
		var match = re.exec(line);
		return match.index + Math.floor( mark.length + match[1].length/2 );
	});

	var meanDistance = (markers[markers.length-1] - markers[0])/(markers.length-1);
	markers.push(Math.floor(markers[markers.length-1] + meanDistance));
	markers.unshift(Math.floor(markers[0] - meanDistance));
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
			if(line && line[v[i]] && line[v[i]] !== " "){

				// first, look for unusual long whitespace within current string
				var whitemarker = line.substring(v[i-1] || 0, v[i]).match(/[^\s][\s]{2,}/);

				if(whitemarker){
					x = v[i];
					v[i] = v[i-1] + whitemarker.index + 1;
				} else {
					x = left = right = v[i];
					while(true){
						left--;
						right++;
						if(!left || !line[left] || line[left] === " "){
							v[i] = left;
							break;
						} else if(!line[right] || line[right] === " "){
							v[i] = right;
							break;
						}
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
	var kcal = parseInt( entry.match(/([0-9]+) Kcal/i), 10);

	var date = new Date(new Date().getFullYear(), 0, (week-1)*7 + x);

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
		type        : y,
		date        : date,
		kcal        : kcal || null,
		properties  : [],
		additives   : additives
	};
}


function parser(file, mensaId, week, callback){
	var names = [];
	exec('pdftotext -q -layout ' + file + " - ", function (error, stdout, stderr){
		var s = stdout.split("\n"), menu = [], rows = [], header;

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
			return item;
		});

		// remove footer
		var footer = s.splice(-3,2).join("");
		var additivesList = extractAdditives(footer);

		// split columns
		var horBounds = getBoundaries(header);
		var cols = getColums(s, horBounds);

		// first column == names; tread separately
		var names = cols.shift().map(trim).join("\n").split(/[\n]{3,}/g).map(trim);
		var veggi = names.indexOf("Vegetarisch");
		if(veggi === -1){
			veggi = names.indexOf("vegetarisch");
		}
		names.splice(veggi, 1);
		names[ veggi - 1 ] += " - Vegetarisch";

		// last column == additional information; ignore.
		// split rows
		for(var x = 0; x < cols.length; x++){
			rows = splitRows(cols[x], names);
			for(var y = 0; y < rows.length; y++){
				menu.push( parse(rows[y], x, names[y] || "", week, additivesList) );
			}
		}

		callback(null, menu);
	});
}

exports.parser = parser;
