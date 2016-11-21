"use strict";

// Modules
var fs = require('fs');

// resources
var users = require("./users.js");
var Authorization = require("./lib/authorize.js");

// cache file;
var portalBanner = fs.readFileSync("node_modules/loginportal/assets/index.html", {encoding: "utf-8"});
var Authorize = Authorization(users);

// constants
const header = "X-Beta-Authorization";

// Exported Function
module.exports = portal;
			
function portal(args) {
	
	// design & args for future usage;	

	return function portal(request, response, next) {
		var username = request.body.betaUsername;
		var password = request.body.betaPassword;

		if(!request.cookies[header]) {
		
			if(!username || !password) {
				// Respond with portalBanner
				response.setHeader("Content-Type", "text/html");
				response.end(portalBanner);
				return;
			}
			if(Authorize.authorizeUser(username, password)) {
				// User authorized - set header & grant access - next();
				var hashObject = Authorize.generate(username, password);
				response.cookie(header,hashObject.hash) // {"expires": hashObject.expires});
				return next();
			} else {
				// Username | password failed
				response.end("Wrong username or password");
				return;
			}
		}
		
		if(!Authorize.test(request)) {
			// Probably request failed to be removed from header 
			// remove header and respond with banner

			response.clearCookie(header);
			response.setHeader("Content-Type", "text/html");
			response.end(portalBanner);
			return;
		}

		// Test Passed - refresh timer
		Authorize.refreshTimer(request.cookies[header]);
		
		return next();	
	}
}

/*
	TODO: Write Tests
*/
