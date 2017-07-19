# Profiles

## Get Manual Input Interest

### HTTP Request

`GET /profile/interest-manual`

> To get a user's manual input interest, use this code:

```javascript
fetch("/profile/interest-manual", {  
  method: 'get',  
  headers: {  
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-access-token":"{user's token}"
  },
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json=> {
  // now json contains user manual input interest
});
```

The sign in API requires 1 parameter in the request header

Parameter          | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

<aside class="notice">
The response are either success or error due to invalid token.
</aside>

### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "status": 302
    }
}
```

Property     | Eesponse                            | Description
------------ | ----------------------------------- | ---------------
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful signin:

```json
// interest response
{
    "interest-manual": {
        "_id": "596efd0c0074ced1af6d0411",
        "__v": 7,
        "interest": [
            {
                "term": "term1",
                "value": 1,
                "_id": "596f0025a58c8eed278f1cac"
            },
            {
                "term": "term2",
                "value": 1,
                "_id": "596f0025a58c8eed278f1cab"
            },
            {
                "term": "term3",
                "value": 1,
                "_id": "596f0025a58c8eed278f1caa"
            },
            {
                "term": "term4",
                "value": 1,
                "_id": "596f0025a58c8eed278f1ca9"
            },
            {
                "term": "term5",
                "value": 1,
                "_id": "596f0025a58c8eed278f1ca8"
            }
        ]
    }
}
```

Property                    | Description
-------------------------   | --------------------------------
interest-manual.interest    | An array of interest object of {term, value}
