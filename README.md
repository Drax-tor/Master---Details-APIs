# Master-Details-APIs
================================
WELCOME
================================
This is a node.js app.
In the package you can find:

-server.js --> nodeJS app

-endpoint.txt --> list of the endpoints covered by the app

-README.txt --> a guide on how to install and use the app

================================ 
INSTALL 
================================ 
First of all, to use a nodeJS app you need the nodeJS environment. 
Here (https://nodejs.org/en/download/package-manager/) you can find easy tutorials to install the environment on you OS.
After this first step, create a folder for the app and copy the server.js file in it. 
Then use the command line to navigate in the dir; we need to install the npm modules used by the app:

-npm install github --> library to connect to the github api

-npm install express --> web framework

-npm install bluebird --> just to allow Promise

-npm install node-cache --> library with a simple use of a cache system

The app is now ready to start. Type node server.js to start the app. The app is bind on 127.0.0.1:8081

================================ 
CURL COMMAND 
================================ 
Here the list of curl command to use the app:

-curl http://127.0.0.1:8081/auth/username/password --> provide your user/pass to authenticate in the system.

-curl http://127.0.0.1:8081/repos --> shows all repos for an authenticated user

-curl http://127.0.0.1:8081/repos/23716407 --> shows one particular repo identified by its ID

-curl http://127.0.0.1:8081/repos/search/Arena --> shows a list of repos filterd by the query

================================ 
AUTH
================================ 
The authentication method chosen is the OAuth2 Token.
In a normal way, to retrieve the token, the user should go on github site and look for it in the account settings.
In the case provided by the app, first the user will log in through the /auth endpoint with username and password; the system will provide the user with the token.
So, everytime we need to use authentication to retrieve some data from github, we can only use the token as our identifier.

PROS

-Easy authentication after first step, only use of token

-No password needed

-Tokens can be limited to specific types of data, and can be revoked by users at any time

CONS

-Need to use username/password at least 1 time
