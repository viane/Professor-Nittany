# Uers

## Local SignIn

### HTTP Request

`POST /users/signin`

> To locally sign in a user, use this code:

```javascript
  fetch("/users/signin", {  
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

<aside class="notice">
The response are either success or error.
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

Property    | Eesponse                            | Description
---------   | ----------------------------------- | ---------------
err.name    | IncorrectPasswordError              | Incorrect password input
err.message | Password or username are incorrect  | Either username or password is not correct

### Example response of successful signin:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIU..."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>

## Local Signup

### HTTP Request

`POST /users/signup`

> To locally sign up a user, use this code:

```javascript
  fetch("/users/signup", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/json"
  },
  body: JSON.stringify({
        'email': '',
        'password' : '',
        'first_name':'',
        'last_name':'',
        'account_role':'',
        'major':[] //allow double or triple majors. An array of major document id such as ["59868428a9a69f4d0028cd58"]
  })
}).then(response=>{return response.json()})
.then(json=> {
  //json contains responses
})
```

###The local sign up API requires 5 parameters

Parameter | Description                  
--------- | --------------------------------
first_name| The first_name of the user
last_name | The last_name of the user       
account_role| the role of the account       
email     | The email of the account        
password  | The password of account
major    | An array of majors' document id

<aside class="notice">The response are either success or error.</aside>
<aside class="notice">major is an array of majors' document id</aside>

```json
{
    "err": {
        "name": "UserExistsError",
        "message": "A user with the given username is already registered"
    }
}
```

```json
{
    "err": {
        "name": "InvalidPasswordFormat",
        "message": "Invalid password format, check the rule of making password."
    }
}
```

```json
{
    "err": {
        "name": "MissRequiredInformation",
        "message": "Miss requireed signup infomation."
    }
}
```

### Example response of error:

Property    | Response       | Description
---------   | -------------- | --------------
err.name    | UserExistsError <br>  <br> InvalidPasswordFormat <br>  <br> MissRequiredInformation | Signup email address existed <br>  <br> Signup password is not valid <br>  <br> Signup required information is missing
err.message | A user with the given username is already registered <br>  <br> Invalid password format, check the rule of making password <br>  <br> Miss requireed signup infomation |

```json
{
    "status": "Successfully registered, check actvition email."
}
```

### Example response of successful singup:

Property    | Response                                       | Description
---------   | ---------------------------------------------- | -----------------
status      | Successfully registered, check actvition email | Successfully create the account, server has sent out an activation email to the email beening registered

## Get Password Rules

### HTTP Request

`POST /users/get-password-rules`

> To locally sign in a user, use this code:

```javascript
  fetch("/users/get-password-rules", {  
    method: 'get'
  }).then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```
There should not be any error response.

### Example response of successful signin:

```json
{
    "min_lowercase_letter": 1,
    "min_uppercase_letter": 1,
    "min_number": 1,
    "min_length": 8,
    "max_special_character": 0
}
```

Property    | Description
---------   | --------------------------------
min_lowercase_letter     | the minimum number of lowercase letter required
min_uppercase_letter     | the minimum number of uppercase letter required
min_number               | the minimum number of digit character required
min_length               | the minimum length of the password
max_special_character    | the maximum number of special character

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>


## Get Major List

### HTTP Request

`POST /users/signup`

> To locally sign up a user, use this code:

```javascript
  fetch("/major-list", {  
  method: 'get',  
  headers: {  
    "Content-type": "application/json"
  }
}).then(response=>{return response.json()})
.then(json=> {
  //json contains responses
})
```

### Example successful response:

Property   | Description                  
---------  | --------------------------------
degree_name| The name of degree
degree_level| Undergraduate only by now
id          | Id of major documents should be send back to server when user register

<aside class="notice">Response will be an array of major documents.</aside>


```json
{
    [
        {
            "_id": "59868428a9a69f4d0028cd56",
            "degree_name": "Accounting",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd57",
            "degree_name": "Advertising/Public Relations-Strategic Communications",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd58",
            "degree_name": "Agribusiness Management",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd59",
            "degree_name": "Biobehavioral Health",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5a",
            "degree_name": "Business",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5b",
            "degree_name": "Criminal Justice",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5d",
            "degree_name": "Economics",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5c",
            "degree_name": "Digital Multimedia Design",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5e",
            "degree_name": "Energy and Sustainability Policy",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd5f",
            "degree_name": "Finance",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd60",
            "degree_name": "Health Policy and Administration",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd61",
            "degree_name": "Human Development and Family Studies",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd62",
            "degree_name": "Information Sciences and Technology",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd63",
            "degree_name": "Integrated Social Sciences",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd64",
            "degree_name": "International Politics",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd66",
            "degree_name": "Law and Society",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd68",
            "degree_name": "Marketing",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd6b",
            "degree_name": "Political Science",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868429a9a69f4d0028cd6d",
            "degree_name": "Security and Risk Analysis",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd67",
            "degree_name": "Letters, Arts, and Sciences",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd6c",
            "degree_name": "Psychology",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd65",
            "degree_name": "Labor and Employment Relations",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd6a",
            "degree_name": "Organizational Leadership",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868428a9a69f4d0028cd69",
            "degree_name": "Nursing",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868429a9a69f4d0028cd6e",
            "degree_name": "Software Engineering",
            "degree_level": "undergraduate",
            "__v": 0
        },
        {
            "_id": "59868429a9a69f4d0028cd6f",
            "degree_name": "Turfgrass Science",
            "degree_level": "undergraduate",
            "__v": 0
        }
    ]
}
```

### Example response of successful singup:

Property    | Response                                       | Description
---------   | ---------------------------------------------- | -----------------
status      | Successfully registered, check actvition email | Successfully create the account, server has sent out an activation email to the email beening registered

<aside class="notice">There should not be any client side error. Either shown or not.</aside>

## Local Account Activation

### HTTP Request

`GET /users/active-account/{token}`

## Request Account Password Change

### HTTP Request

`POST /users/request-reset-password`

> To submit a password reset request:

```javascript
fetch("/users/request-reset-password", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/json"
  },
  body: JSON.stringify({
        'email': ''
  })
}).then(response=>{return response.json()})
.then(json=> {
  //json contains responses
})
```
### Example Response

An email will send to user with a link (/users/update-password/{token}) to reset their password

```json
{
    "status": "success",
    "message": "An e-mail has been sent to harryhappy111@gmail.com with further instructions.",
    "token": "6076253795a31fade21b1c6b106cd0bf1df08334"
}
```

## Get Email by Password Request Token (The link will be in the user's email)

### HTTP Request

`GET /users/update-password/{token}`

Sever will send back user's email and token, which are used to update password.

### Example of response information:

```json
{
    "email":"harryhappy111@gmail.com",
    "token":"6076253795a31fade21b1c6b106cd0bf1df08334"
}
```


## Update Account Password

### HTTP Request

`POST /users/update-password`

> To rest password:

```javascript
fetch("/users/update-password", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/json"
  },
  body: JSON.stringify({
        'email': '',
        'token': '',
        'password': ''
  })
}).then(response=>{return response.json()})
.then(json=> {
  //json contains responses
})
```
### Example callback response of successful reset:

```json
{
    "status": "Password reset successful",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTdmODQzNzlkYjczMzZiNjhiZDZhMGEiLCJzdGF0dXMiOiJhY3RpdmUiLCJhY2NvdW50X3JvbGUiOiJzdHVkZW50IiwiaWF0IjoxNTAxNTMyNDM4LCJleHAiOjE1MDE1MzYwMzh9.9Dwj-iM9AcL3UN6As8GoYikd1HS-9YLYo8bBiKryhW0"
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

## Facebook SignIn

### HTTP Request

`Get /users/signup-facebook`


### Example callback response of successful signin at `/users/signin/callback?xxx=xxx`:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>

## Google SignIn

### HTTP Request

`Get /users/signup-google`


### Example callback response of successful signin at `/users/signin/callback?xxx=xxx`:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>

## Linkedin SignIn

### HTTP Request

`Get /users/signup-linkedin`


### Example callback response of successful signin at `/users/signin/callback?xxx=xxx`:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>


## Twitter SignIn (Currently Disabled)

### HTTP Request

`Get /users/signup-twitter`


### Example callback response of successful signin at `/users/signin/callback?xxx=xxx`:

```json
{
    "status": "Login successful!",
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Property    | Description
---------   | --------------------------------
status      | Show login status
success     | Boolen flag
token       | Access token

<aside class="notice">
`token: xxxx...` is logined user identifier for all requests.
</aside>

## Sign Out

To sign out a user, simply discard the token on client side since server will not store any token.

