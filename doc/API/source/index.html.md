---
title: IAA API Reference
language_tabs:
  - Javascript
toc_footers:
  - '<a href=''#''>Home</a>'
  - '<a href=''https://github.com/tripit/slate''>Documentation Powered by Slate</a>'
includes:
  - errors
search: true
---

# Introduction

Welcome to the IAA API! You can use our API to access IAA API endpoints.

We have language bindings in NodeJS! You can view code examples in the dark area to the right.

# Uers

## Local SignIn

> To locally sign in a user, use this code:

```javascript
  fetch("https://localhost:3443/users/signin", {  
    method: 'post',  
    headers: {  
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
    },  
    body: 'email={email}&password={password}',
    credentials: 'include'
  }).then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```

The sign in API requires 2 parameters

Parameter | Description
--------- | --------------------------------
email     | The email of the account
password  | The password of account

The response are either success or error.

<aside class="success">
`token: xxxx...` is logined user identifier for all requests.
</aside>


### Example response of error:

```json
{
    "err": {
        "name": "IncorrectPasswordError",
        "message": "Password or username are incorrect"
    }
}
```

Property    | Description
---------   | --------------------------------
err.name    | Error type
err.message | Error description



### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZkM2E3YmRiNjExZjRjYTBmNTJmMzgiLCJpYXQiOjE1MDAzMzQxMzcsImV4cCI6MTUwMDMzNzczN30.g-NvrjfPadduuSomMBXBW8NJ9i2_6_bNJyELO4vAK-o"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

## Local Signup

> To locally sign up a user, use this code:

```javascript
  fetch("https://localhost:3443/users/signup", {  
    method: 'post',  
    headers: {  
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
    },  
    body: 'email={email}&password={password}&first_name={first_name}&last_name={last_name}&account_role={account_role}',
    credentials: 'include'
  }).then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```

The local sign up API requires 5 parameters

Parameter | Description
--------- | --------------------------------
first_name| The first_name of the user
last_name | The last_name of the user
account_role| the role of the account
email     | The email of the account
password  | The password of account

The response are either success or error.


### Example response of error:
#### Signup email address existed 
```json
{
    "err": {
        "name": "UserExistsError",
        "message": "A user with the given username is already registered"
    }
}
```

Property    | Description
---------   | --------------------------------
err.name    | Error type
err.message | Error description

#### Signup password is not valid
```json
{
    "err": {
        "name": "InvalidPasswordFormat",
        "message": "Invalid password format, check the rule of making password."
    }
}
```

Property    | Description
---------   | --------------------------------
err.name    | Error type
err.message | Error description

#### Signup required information is missing
```json
{
    "err": {
        "name": "MissRequiredInformation",
        "message": "Miss requireed signup infomation."
    }
}
```

Property    | Description
---------   | --------------------------------
err.name    | Error type
err.message | Error description

### Example response of successful singup:

```json
{
    "status": "Successfully registered, check actvition email."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

## Facebook SignIn

> To sign in a facebook user, make a http request:
`get https://localhost:3443/users/facebook`

The response are either success or error.

<aside class="success">
`token: xxxx...` is logined user identifier for all requests.
</aside>


### Example response of error:

User login error will be handled on the facebook's login page



### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZkM2E3YmRiNjExZjRjYTBmNTJmMzgiLCJpYXQiOjE1MDAzMzQxMzcsImV4cCI6MTUwMDMzNzczN30.g-NvrjfPadduuSomMBXBW8NJ9i2_6_bNJyELO4vAK-o"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

## Google SignIn

> To sign in a google user, make a http request:
`get https://localhost:3443/users/google`

The response are either success or error.

<aside class="success">
`token: xxxx...` is logined user identifier for all requests.
</aside>


### Example response of error:

User login error will be handled on the google's login page



### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZkM2E3YmRiNjExZjRjYTBmNTJmMzgiLCJpYXQiOjE1MDAzMzQxMzcsImV4cCI6MTUwMDMzNzczN30.g-NvrjfPadduuSomMBXBW8NJ9i2_6_bNJyELO4vAK-o"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

## Linkedin SignIn

> To sign in a linkedin user, make a http request:
`get https://localhost:3443/users/linkedin`

The response are either success or error.

<aside class="success">
`token: xxxx...` is logined user identifier for all requests.
</aside>


### Example response of error:

User login error will be handled on the linkedin's login page



### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZkM2E3YmRiNjExZjRjYTBmNTJmMzgiLCJpYXQiOjE1MDAzMzQxMzcsImV4cCI6MTUwMDMzNzczN30.g-NvrjfPadduuSomMBXBW8NJ9i2_6_bNJyELO4vAK-o"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token


## Twitter SignIn (Currently Disabled)

> To sign in a twitter user, make a http request:
`get https://127.0.0.1:3443/users/twitter`

The response are either success or error.

<aside class="success">
`token: xxxx...` is logined user identifier for all requests.
</aside>


### Example response of error:

User login error will be handled on the twitter's login page



### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTZkM2E3YmRiNjExZjRjYTBmNTJmMzgiLCJpYXQiOjE1MDAzMzQxMzcsImV4cCI6MTUwMDMzNzczN30.g-NvrjfPadduuSomMBXBW8NJ9i2_6_bNJyELO4vAK-o"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token


## Logout

> To logout a user, use this code:

```javascript
  fetch("https://localhost:3443/users/logout", {  
    method: 'get',  
    headers: {  
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"  
    },  
    body: 'email={email}&password={password}',
    credentials: 'include'
  }).then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```
Client side should discard the token.

The logout in API does not require any parameters.



## Get All Kittens

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
api.kittens.get
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
api.kittens.get()
```

```shell
curl "http://example.com/api/kittens"
  -H "Authorization: meowmeowmeow"
```

```javascript
const kittn = require('kittn');

let api = kittn.authorize('meowmeowmeow');
let kittens = api.kittens.get();
```

> The above command returns JSON structured like this:

```json
[
  {
    "id": 1,
    "name": "Fluffums",
    "breed": "calico",
    "fluffiness": 6,
    "cuteness": 7
  },
  {
    "id": 2,
    "name": "Max",
    "breed": "unknown",
    "fluffiness": 5,
    "cuteness": 10
  }
]
```

This endpoint retrieves all kittens.

### HTTP Request

`GET http://example.com/api/kittens`

### Query Parameters

Parameter    | Default | Description
------------ | ------- | --------------------------------------------------------------------------------
include_cats | false   | If set to true, the result will also include cats.
available    | true    | If set to false, the result will include kittens that have already been adopted.

<aside class="success">
Remember — a happy kitten is an authenticated kitten!
</aside>

## Get a Specific Kitten

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
api.kittens.get(2)
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
api.kittens.get(2)
```

```shell
curl "http://example.com/api/kittens/2"
  -H "Authorization: meowmeowmeow"
```

```javascript
const kittn = require('kittn');

let api = kittn.authorize('meowmeowmeow');
let max = api.kittens.get(2);
```

> The above command returns JSON structured like this:

```json
{
  "id": 2,
  "name": "Max",
  "breed": "unknown",
  "fluffiness": 5,
  "cuteness": 10
}
```

This endpoint retrieves a specific kitten.

<aside class="warning">Inside HTML code blocks like this one, you can't use Markdown, so use <code>&lt;code&gt;</code> blocks to denote code.</aside>

### HTTP Request

`GET http://example.com/kittens/<ID>`

### URL Parameters

Parameter | Description
--------- | --------------------------------
ID        | The ID of the kitten to retrieve

## Delete a Specific Kitten

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
api.kittens.delete(2)
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
api.kittens.delete(2)
```

```shell
curl "http://example.com/api/kittens/2"
  -X DELETE
  -H "Authorization: meowmeowmeow"
```

```javascript
const kittn = require('kittn');

let api = kittn.authorize('meowmeowmeow');
let max = api.kittens.delete(2);
```

> The above command returns JSON structured like this:

```json
{
  "id": 2,
  "deleted" : ":("
}
```

This endpoint retrieves a specific kitten.

### HTTP Request

`DELETE http://example.com/kittens/<ID>`

### URL Parameters

Parameter | Description
--------- | ------------------------------
ID        | The ID of the kitten to delete
