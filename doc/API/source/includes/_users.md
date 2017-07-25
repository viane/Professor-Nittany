# Uers

## Local SignIn

### HTTP Request

`POST /users/signin`

> To locally sign in a user, use this code:

```javascript
  fetch("http://localhost:3000/users/signin", {  
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
  fetch("http://localhost:3000/users/signup", {  
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

###The local sign up API requires 5 parameters

Parameter | Description                  
--------- | --------------------------------
first_name| The first_name of the user
last_name | The last_name of the user       
account_role| the role of the account       
email     | The email of the account        
password  | The password of account

<aside class="notice">The response are either success or error.</aside>

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
