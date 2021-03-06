# this is a techtest for Netcosports x OnRewind

## now this project can be run via docker-compose with all services needed

* first you must install or run docker-engine or docker desktop
* then run `docker-compose up -d --build`
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

### body for post & put request
body of the request must be as a model instance without id & timestamps

for example at `POST /video` body must be like:
```json
{
    "name": "best video ever",
    "url": "an url",
    "description": "this is a short description"
}
```

## additional for videos: search

you can search videos by using `GET /video/_/search?term=searchTerm&page=optional`

## for user part of the app

| method | route | definition | additionnal params |
---|---|---|---
GET | /user/ | get current user entry | authorization header must be set
POST | /user/login | log user with his credentials | for body see below
POST | /user/register | register a user | for body see below
POST | /user/favorites | get user favorites | 
POST | /user/favorites/{videoId} | add a video to user favorites | 

### body for login & register

```json
{
    "email": "email@example.com",
    "password": "password",
    "confirm_password": "only for register confir your password",
}
```

# have fun