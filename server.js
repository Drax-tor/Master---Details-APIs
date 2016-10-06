var express = require('express');
var app = express();
var GitHubApi = require("github");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
var fs = require('fs');

var TEST_TOKEN="c118ce8f66709825bc3a1dd21f2ad6cb91576a57";

//Default error handling
app.use(errorHandler);
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
}

//Init github library
var github = new GitHubApi({
    // optional args
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "",
    headers: {
        "user-agent": "My-Cool-GitHub-App"
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

//Endpoint for authentication
app.get('/auth/:user/:pass', function (req, res){
	//sinchronous call
	github.authenticate({
	    type: "basic",
	    username: req.params.user,
	    password: req.params.pass
	});
	//Ask for token with scopes
	github.authorization.create({
	    scopes: ["user", "public_repo", "repo", "repo:status", "gist"],
    	note_url: "http://localhost:8081",
    	note: "Test",
	}, function(err, msg) {
	    if (msg.token) {
	    	//Save token in filesystem for test purpose
	    	fs.writeFile("token.txt", msg.token, function(err) {
			    if(err) {
			        return console.log(err);
			    }
			    console.log("Token saved!");
			}); 
	        res.write(msg.token);
	    }
	});
})

//return the list of the repo of the autenticated user
app.get('/repos', function (req, res) {
	var token;
	fs.readFile('token.txt', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	github.authenticate({
	    type: "oauth",
	    token: data,
	});
	console.log(data);
	//check if I have the result cached
	myCache.get( "repos", function( err, value ){
	  if( !err ){
	    if(value == undefined){
	      	// cache not found 
	      	console.log("Cache not found, connecting to api.github.com");
	      	//Retreivig the repos from github
	        github.repos.getAll({

			}, function(err, msg) {
				if(!err){
					response="{";
					for (var i = 0, len = msg.length; i < len; i++){
						response+="{id:"+msg[i].id + ", name:" + msg[i].name + "}";
					}
					response+="}";
				    console.log(msg.meta.status);
				    //Caching the data for next time
				    myCache.set( "repos", response, function( err, success ){
				  	if( !err && success ){
					    console.log("Cache created!");
					  }else{
					  	console.error("Error! Cache not created");
					  }
					});
			      	//Sending the response to the client
			      	res.write(JSON.stringify(response));
			       }else{
			       	console.error(err.message);
			    	res.write(err.message);
			    }
			});	      		      
	    }else{
	      console.log("Cache found: " + value);
	      //Cache found, Sending back the data
	      res.write(JSON.stringify(value)); 
	    }
	  }
	});
	});
	
	
   
})

//return the data of a single repo dientified by its id
app.get('/repos/:id', function (req, res) {
   //No auth required
   //check if I have the result cached
	myCache.get( "repos-"+req.params.id, function( err, value ){
	  if( !err ){
	    if(value == undefined){
	      	// cache not found 
	      	console.log("Cache not found, connecting to api.github.com");
	      	//Retreivig the repo from github
	         github.repos.getById({
	         	id: req.params.id
			}, function(err, msg) {
				if(!err){
					response="{";
					response+="id:"+msg.id + ", owner: { login: " + msg.owner.login + ", id: " + msg.owner.id + ", }, name: " 
					+ msg.name + ", description: " + msg.description + ", pushed_at: " + msg.pushed_at + ", created_at: " + msg.created_at + ", updated_at: " + msg.updated_at + ","
					response+="}";
				    console.log(response);
				    //Caching the data for next time
				    myCache.set( "repos-"+req.params.id, response, function( err, success ){
				  	if( !err && success ){
					    console.log("Cache created!");
					  }else{
					  	console.error("Error! Cache not created");
					  }
					});
			      	//Sending the response to the client
			      	res.write(JSON.stringify(response));
			    }else{
			    	console.error(err.message);
			    	res.write(err.message);
			    }
			});	      		      
	    }else{
	      console.log("Cache found: " + value);
	      //Cache found, Sending back the data
	      res.write(JSON.stringify(value)); 
	    }
	  }
	});
})

//return a list of repos searched by query param
app.get('/repos/search/:query', function (req, res) {
	//No auth required
	//check if I have the result cached
	myCache.get( "repos+"+req.params.query, function( err, value ){
	  if( !err ){
	    if(value == undefined){
	      	// cache not found 
	      	console.log("Cache not found, connecting to api.github.com");
	      	//Retreivig the repos from github
	         github.search.repos({
	         	q: req.params.query
			}, function(err, msg) {
				if(!err){
					response="{";
					for (var i = 0, len = msg.items.length; i < len; i++){
						response+="{id:"+msg.items[i].id + ", name:" + msg.items[i].name + ", description: " + msg.items[i].description + "}";
					}
					response+="}";
				    console.log(response);
				    //Caching the data for next time
				    myCache.set( "repos+"+req.params.query, response, function( err, success ){
				  	if( !err && success ){
					    console.log("Cache created!");
					  }else{
					  	console.error("Error! Cache not created");
					  }
					});
			      	//Sending the response to the client
			      	res.write(JSON.stringify(response));
			     }else{
			     	console.error(err.message);
			    	res.write(err.message);
			    }
			});	      		      
	    }else{
	      console.log("Cache found: " + value);
	      //Cache found, Sending back the data
	      res.write(JSON.stringify(value)); 
	    }
	  }
	});
})

//Server init
var server = app.listen(8081, function () {
   var host = "127.0.0.1";
   var port = "8081";

   console.log("Example app listening at http://%s:%s", host, port)
})