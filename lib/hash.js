var fs = require("fs");

module.exports = Hashes;

/*
	TODO: IMPROVE PERFORMANCE OF THIS LIBRARY
*/

function Hashes() {
	var Hashfd;
	
	function convertoArrayHashes() {
		var Hashfile = fs.readFileSync("hashes", "utf8");
		function removeSparse(arr) {
			var main, rest;
			// Eliminate sparse elements
			for(var x=0; x<arr.length; x++) {
				if(arr[x] === undefined) {
					main = arr.slice(0, x+1);
					main.pop();
					rest = arr.slice(x+1);
					arr = main.concat(rest);
					return removeSparse(arr);
				}
			}
			return arr;
		}
		
		function createObject(hashObject) {
			var hashObjectArray = hashObject.split(" ");
			return {
				"hash": hashObjectArray[0],
				"username": hashObjectArray[1],
				"expires": hashObjectArray[2]	
			}
		}
		
		var hashes = Hashfile.split("\n").map(function(item) {					
			return item.length > 0 ? createObject(item) : undefined
		});
		
		return removeSparse(hashes);
	} 
	
	function deleteFromFile(HashObject) {
		var file = fs.createReadStream("hashes");
		var query = HashObject.hash;
		
		// For access in different scopes
		var data;
		var Data;

		function getPoints(query) {
			var start= 0;
			var LineData;
		
			if(!data) {
				return;
			}
					
			for(var line=0; line<data.length; line++) {
				// split up each lines and check first arg;
				LineData = data[line].split(" "); // A single line splitted into an array
				if(query === LineData[0]) {
					//remaining = data.slice(line);
					return {
						"start": start,
						"length": LineData.join("").length+LineData.length
					}
				}
				start += LineData.join("").length+LineData.length;
			}
			return {"error": "Not found"};
		}

		file.on("data", function(rawData) {	
			// For convieniece.
			data = rawData.toString().split("\n"); // An array of Lines	
			Data = rawData.toString();
		});

		file.on("end", function(err) {
			var points = getPoints(query);	
			var start = points.start; 
			if(points.error) {
				return;
			}
			var end = Data.substr(start).indexOf("\n");

			var upperBond = Data.substr(0, start);
			var lowerBond = Data.substr(start+end+1);

			var file = upperBond.concat(lowerBond);
			
			// Write To File
			fs.writeFile("hashes", file);
		});
	}
		
	try{
		// if this throws an error, the file is not there
		fs.accessSync('hashes', fs.F_OK);
		// Hashfd needed 
		Hashfd = fs.openSync("hashes", "r+");
	} catch (error) {
		// create it
		Hashfd = fs.openSync("hashes", "w");
	}
	
	var arrayHashes = convertoArrayHashes();
	
	return {
		'storeHash': function(hash) {
			// Write information to file
			fs.writeFile("hashes", hash.hash+ " " +hash.username+ " " +hash.expires+ "\n");
		
			// reflect here - authorizedHashes
			arrayHashes.push(hash);
		},
		'delete': function(hashObject) {
			deleteFromFile(hashObject);
			
		},
		'authorized': function() {
			return arrayHashes;
		}
	}
}
