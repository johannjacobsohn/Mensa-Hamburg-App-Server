/**
 *
 *
 *
 *
 *
 *
 */
var exec = require('child_process').exec;

function parser(file, mensaId, week, callback){
	var callbacks = 0;
	var result = [];
	var names = [];

//~ console.log("try to parse", file)

	exec('convert -density 300 -depth 8 -quality 85 ' + file + ' temp.png', function(e){
		//~ console.log("converted...")
		exec('./source/parser/uke/find_sections.m temp.png', function (error, stdout, stderr){
			//~ console.log("found sections?", error, stdout, stderr)
			xy = JSON.parse(stdout.replace("\n", ""));
			xs = xy.x;
			ys = xy.y;

			for(i = 0; i<xs.length-1; i++){
				for(j = 1; j<ys.length-1; j++){
					callbacks++;
					(function(){
						var x = i;
						var y = j;
						exec('convert temp.png -crop ' + (xs[x+1] - xs[x]) + 'x' + (ys[y+1] - ys[y]) + '+' + xs[x] + '+' + ys[y] + ' +repage '+ x +''+ y +'.png', function (error, stdout, stderr){
							exec('tesseract '+ x +''+ y +'.png '+ x +''+ y +' -l deu > /dev/null && cat '+ x +''+ y +'.txt', function (error, stdout, stderr){
								//~ console.log("tesseract says:", stdout)
								if(x === 0){
									names[y-1] = scrub(stdout);
								} else {
									result.push(parse(stdout, x, y, week));
								}
								callbacks--;
								if(!callbacks){
									result = clean_result(result, names);
									callback(null, result);
									//~ console.log(result)
								}

								// cleanup
								//~ exec('rm *.png *.txt');
							});
						});
					})();
				}
			}
		});
	});
}

// scrub string
function scrub(string){
	string = string.replace(/II/g, "ll ");
	string = string.replace(/[\s]+/g, " ").trim();
	string = string.charAt(0).toUpperCase() + string.slice(1);
	string = string.replace(/ ß/g, "ß");
	string = string.replace(/ e[\s]*-/g, "€ -");
	return string;
}

//~ parse entry
function parse(entry, x, y, week){
	var a = entry.match(/(€(.+))/i);
	var price = a && a.length ? a[2] : "0,00";
	price = parseFloat( price.replace(/-./, "0.").replace(",", ".") );
	//~ console.log("scrub entry:", entry)
	var dish = scrub( entry );
	dish = dish.replace(/€.*/, "").trim();
	//~ console.log("scrubed:", dish)

	date = new Date(new Date().getFullYear(), 0, (week-1)*7 + x - 1);
	dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();

	return {
		studPrice   : price,
		normalPrice : price,
		name        : dish,
		mensaId     : "uke",
		week        : week,
		type        : y,
		date        : dateString,
		properties  : [],
		additives   : []
	};
}

//~ to be run once the pdf has been parsed
function clean_result(result, names){
	names[6] = names[8] = names[7];
	names = names.map(function(item){
		if(item){
			return item.replace(/^L /, "").replace(/ l$/, "");
		}
	});
	names[names.length-1] = names[names.length-2] =  names[names.length-2] + " " + names[names.length-1]; 
	result = result.map(function(item){
		item.type = names[item.type];
		return item;
	});
	return result;
}

exports.parser = parser;
