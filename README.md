# loginportal

![loginportal-Banner](http://res.cloudinary.com/thehub/image/upload/v1479446857/construction_msplpz.jpg)

A nodejs express compatible middleware showing a portal, for restricted login access. This module allows people to follow you through, your development 
while keeping others from seeing the site. It provides you a login portal, that provided restricted access to the page. 



## How To
```javascript
	npm install loginportal
```

Create a file called users.js in the root of loginportal.
##### Note: loginportal does not come with any default, so it would raise any error, if not created before use.
```javascript
module.exports = [
		{"username": "subomi", "password": "fineboy"},
]
```
The users.js file exports an array of users containing their username and password.

### Expressjs Example
```javascript
var express = require('express');
var portal = require('loginPortal')();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')();

var app = express();


app.use(cookieParser);
app.use(bodyParser.urlencoded());
app.use(portal);
app.post("/", function(request, response) {
	response.end("Glory to God");
});

app.listen(8080);
```
## NOTES TO USAGE
* The portal route is the route that restricts access. 
* It must be behind cookieParser and bodyParser.urlencoded in that order. 
* Those modules are dependencies, but are not internally used as they are general modules used in nodejs express development.

## LICENSE
MIT
