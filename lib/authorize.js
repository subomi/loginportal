// Modules
var crypto = require("crypto")
var Hashes = require("./hash.js");

module.exports = Authorization;

function Authorization (users) {
	if(!(this instanceof Authorization)) {
		return new Authorization(users);
	}

	function retrieveHashObject(hash) {
		return authorizedHashes.filter(function(item, index, array) {
			return item.hash === hash;
		})[0];
	}
	
	function retrievepassword(username) {
		for(var x=0; x<=users.length-1; x++) {
			if(username === users[x].username) {
				return users[x].password;
			}
		}
	}

	// Private scope variables
	var myHashes = Hashes();
	var authorizedHashes;
	
	//exposed
	var authorizedHashes = myHashes.authorized();
	
	this.authorizeUser = function(username, password) {		
		return users.some(function(item, index, array) {
			if(item.username === username) {
				return item.password === password ? true : false;
			}
		});
	}
	
	this.generate = function(username, password) {
		// To securely generate an authorization token 
		// generate a sha1 of the password
		var hash =  crypto.createHash("sha1").update(password).digest("hex");		
		var hashObject = {"hash": hash, username: username, expires: 3600000}; //Expires in 1 hour
		
		myHashes.storeHash(hashObject);
		
		this.setTimer(hashObject);
		return hashObject; 
	}
	
	this.test = function (request) {
		var header = request.cookies["X-Beta-Authorization"];
				
		if(!header) {
			return false;
		}
		
		var hashObject = authorizedHashes.filter(function(item) {
			return item.hash === header;
		});
	
		try {
			var username = hashObject[0]["username"];	
		} catch(err) {
			return false;
		}
		var password = retrievepassword(username);
		
		var hashCompare = crypto.createHash("sha1").update(password).digest("hex");
		return header === hashCompare ? true : false;
		
	}

	this.setTimer = function(hashObject) {
		// Set Timeout for expiring
		hashObject.TimerId = setTimeout(function() {
			// Delete from Array;
			var index = authorizedHashes.indexOf(hashObject);
			var upper = authorizedHashes.slice(0, index+1);
			var lower = authorizedHashes.slice(index+1);
			upper.pop();
			
			// Make the new reference 
			authorizedHashes = upper.concat(lower);
			
			// Delete from file
			myHashes.delete(hashObject);
			
		}, hashObject.expires);
	}
	
	this.refreshTimer = function(hash) {
		var hashObject = retrieveHashObject(hash);
		clearTimeout(hashObject.TimerId);
		this.setTimer(hashObject);
	} 
}
