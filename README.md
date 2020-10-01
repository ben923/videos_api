# this is a techtest for Netcosports x OnRewind

## you can't run this project if you don't have database or proper config.json file at the root directory (for my supervisor i will send you the config via email)

* first run tests it should be okay but you can even check
* then run npm start it will load express, bootstraps, and controllers
* controllers have default CRUD methods but you can override/add methods
* controllers automatically load his related model so the model must be named as the controller

## API definition
## for both videos & tags:
* entity is the entityname at singular

| method | route | definition | additionnal params |
---|---|---|---
GET | /{entity}/ | get all entries | paginate with "&page=" param
POST | /{entity}/ | insert one entry | see below for the request body
GET | /{entity}/{id} | get one entries |
PUT | /{entity}/{id} | get one entries | see below for the body
DELETE | /{entity}/{id} | delete one entry |

## for videos relations 

| method | route | definition | additionnal params |
---|---|---|---
GET | /video/{id}/tag/{tagId} | associate one tag to one video |
DELETE | /video/{id}/tag/{tagId} | delete on tag from a video |
