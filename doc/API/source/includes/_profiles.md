# Profiles

## Retrieve Input Interest

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

The API requires 1 parameter in the request header

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

Property     | Response                            | Description
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

## Upload Input Interest

### HTTP Request

`POST /profile/interest-manual`

> To add or update a user's input interest, use this code:

```javascript
const payload =  {interest_manual:['Interest Term1','Interest Term2',{...}]};
fetch("/profile/interest-manual", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/json; charset=UTF-8",
    "x-access-token":"{token}"
  },
  body:JSON.stringify(payload),
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json => {
  // now response is in json
});
```

The API requires 1 token in the header

header             | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

The API requires 1 parameter in the body

Parameter          | Description
------------------ | ------------------------------------------
interest_manual    | An array of interest term in string format


### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "name": "LoginError",
        "message": "You are not authenticated!",
        "code": 302
    }
}

// error due to minimal restriction of interest characters
{
    "message": "Minimal interest length is 2",
    "error": {
        "name": "ContentError",
        "message": "Minimal interest length is 2",
        "code": 205
    }
}
```

Property     | Response                            | Description
------------ | ----------------------------------- | ---------------
status       | error                               | Flag of the response
message      | You are not authenticated!          | User signin token is invalid
error.status | 302  <br>  205                      | Indicate user should be redirected to signin page  <br> Indeciate user should reset content in the request

### Example response of successful post:

```json
// post response
{
    "status": "success",
    "message": "Done updating"
}
```

Property     | Response             | Description
-----------  | -------------------- | --------------------------------
status       | success              | Flag of response
message      | Done updating        | Note

## Retrieve Introduction

### HTTP Request

`GET /profile/introduction`

> To add or update a user's introduction, use this code:

```javascript
fetch("/profile/introduction", {  
  method: 'get',  
  headers: {  
    "Content-type": "application/json; charset=UTF-8",
    "x-access-token":"{token}"
  }
}).then(response=>{return response.json()})
.then(json => {
  // now response is in json
});
```

The API requires 1 token in the header

header             | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "name": "LoginError",
        "message": "You are not authenticated!",
        "code": 302
    }
}
```

Property     | Response                            | Description
------------ | ----------------------------------- | ---------------
status       | error                               | Flag of the response
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful get:

```json
// get response
{
    "introduction": "Hello everyone.My name is Jim Smith, and I'm a systems analyst. I've been with the company for 5 years now. I started off as a technician and over the years progressed to my current role. When I'm not working, I like to spend time with my son. We do a lot of fishing and camping together. My wife isn't a big fan, but she tags along with us most of the time. It's good to be here and to meet you all in person. We all exchange emails and phone calls, but it's hard to really know someone until you've met face to face. I'm looking forward to talking about our upcoming project with all of you. This is just an example, but it hits on all of the major points that you want to include in a self introduction speech. Keep these kinds of brief speeches ready in your mind for these types of group gatherings. If you know you have one coming up, take some time to practice yours to be prepared before the meeting takes place.\n"
}
```

Property     | Response                      | Description
-----------  | ----------------------------- | --------------------------------
introduction | {Txt{...} }                     | Actual introduction text

## Retrieve Personality Assessement

### HTTP Request

`GET /profile/personality-assessement`

> To add or update a user's introduction, use this code:

```javascript
fetch("/profile/personality-assessement", {  
  method: 'get',  
  headers: {  
    "Content-type": "application/json; charset=UTF-8",
    "x-access-token":"{token}"
  }
}).then(response=>{return response.json()})
.then(json => {
  // now response is in json
});
```

The API requires 1 token in the header

header             | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "name": "LoginError",
        "message": "You are not authenticated!",
        "code": 302
    }
}
```

Property     | Response                            | Description
------------ | ----------------------------------- | ---------------
status       | error                               | Flag of the response
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful get:

```json
// get response
{
    "_id": "59708c3ebf58a3c793a7574d",
    "updatedAt": "2017-07-20T10:55:58.788Z",
    "createdAt": "2017-07-20T10:55:58.075Z",
    "__v": 0,
    "evaluation": {
        "warnings": [
            {
                "message": "There were 180 words in the input. We need a minimum of 600, preferably 1,200 or more, to compute statistically significant estimates",
                "warning_id": "WORD_COUNT_MESSAGE"
            }
        ],
        "values": [
            {
                "raw_score": 0.6367704049817837,
                "percentile": 0.2621898191746721,
                "category": "values",
                "name": "Conservation",
                "trait_id": "value_conservation"
            },
            {...}
        ],
        "needs": [
            {
                "raw_score": 0.8109271831148943,
                "percentile": 0.9611904707100504,
                "category": "needs",
                "name": "Challenge",
                "trait_id": "need_challenge"
            },
            {...}
        ],
        "personality": [
            {
                "children": [
                    {
                        "raw_score": 0.5383956268628514,
                        "percentile": 0.8274409069597289,
                        "category": "personality",
                        "name": "Adventurousness",
                        "trait_id": "facet_adventurousness"
                    },
                    {...}
                ],
                "raw_score": 0.8020792454808571,
                "percentile": 0.9528793156796703,
                "category": "personality",
                "name": "Openness",
                "trait_id": "big5_openness"
            },
            {
                "children": [
                    {
                        "raw_score": 0.7303678775000645,
                        "percentile": 0.7860256054411036,
                        "category": "personality",
                        "name": "Achievement striving",
                        "trait_id": "facet_achievement_striving"
                    },
                    {...}
                ],
                "raw_score": 0.6733653861546127,
                "percentile": 0.8343652317084148,
                "category": "personality",
                "name": "Conscientiousness",
                "trait_id": "big5_conscientiousness"
            },
            {
                "children": [
                    {
                        "raw_score": 0.6315730495073002,
                        "percentile": 0.9626426699173913,
                        "category": "personality",
                        "name": "Activity level",
                        "trait_id": "facet_activity_level"
                    },
                    {...}
                ],
                "raw_score": 0.6034943331179414,
                "percentile": 0.8802511967737836,
                "category": "personality",
                "name": "Extraversion",
                "trait_id": "big5_extraversion"
            },
            {
                "children": [
                    {
                        "raw_score": 0.7522105433894992,
                        "percentile": 0.9103989313381455,
                        "category": "personality",
                        "name": "Altruism",
                        "trait_id": "facet_altruism"
                    },
                    {...}
                ],
                "raw_score": 0.7450801110866009,
                "percentile": 0.5288927111468087,
                "category": "personality",
                "name": "Agreeableness",
                "trait_id": "big5_agreeableness"
            },
            {
                "children": [
                    {
                        "raw_score": 0.5308996793657599,
                        "percentile": 0.46491279647936234,
                        "category": "personality",
                        "name": "Fiery",
                        "trait_id": "facet_anger"
                    },
                    {...}
                ],
                "raw_score": 0.4862254706925009,
                "percentile": 0.6310211452973461,
                "category": "personality",
                "name": "Emotional range",
                "trait_id": "big5_neuroticism"
            }
        ],
        "processed_language": "en",
        "word_count_message": "There were 180 words in the input. We need a minimum of 600, preferably 1,200 or more, to compute statistically significant estimates",
        "word_count": 180
    }
}
```

Property     | Response                      | Description
-----------  | ----------------------------- | --------------------------------
updatedAt |                       |  
createdAt |                       |  
evaluation |                       |  
evaluation.warnings |                       |  
evaluation.values |                       |  
evaluation.needs |                       |  
evaluation.personality |                       |  
evaluation.word_count |                       |  

## Update Introduction

### HTTP Request

`POST /profile/update-introduction`

> To add or update a user's introduction, use this code:

```javascript
const payload =  {introdcution:"{introduction text{...}}"};
fetch("/profile/update-introduction", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/json; charset=UTF-8",
    "x-access-token":"{token}"
  },
  body:JSON.stringify(payload),
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json => {
  // now response is in json
});
```

The API requires 1 token in the header

header             | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

The API requires 1 parameter in the body

Parameter          | Description
------------------ | ------------------------------------------
introdcution       | Single string of introduction


### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "name": "LoginError",
        "message": "You are not authenticated!",
        "code": 302
    }
}
```

Property     | Response                            | Description
------------ | ----------------------------------- | ---------------
status       | error                               | Flag of the response
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful post:

```json
// post response
{
    "status": "success",
    "message": "Done updating"
}
```

Property     | Response             | Description
-----------  | -------------------- | --------------------------------
status       | success              | Flag of response
message      | Done updating        | Note


## Update Introduction by file

### HTTP Request

`POST /profile/update-introduction-by-file`

> To add or update a user's introduction by a text or word file, use this code:

```javascript
let formData = new FormData();
formData.append("userfile", fileInputElement.files[0]);

fetch("/profile/update-introduction-by-file", {  
  method: 'post',  
  headers: {  
    "x-access-token":"{token}"
  },
  body: formData,
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json => {
  // now response is in json
});
```

The API requires 1 token in the header

header             | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

The API requires 1 parameter in the body

Parameter          | Description
------------------ | ------------------------------------------
formData           | Input file from html

<aside class="warning">
The API only accept file that has extension of .txt, .doc or .docx
</aside>

### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "name": "LoginError",
        "message": "You are not authenticated!",
        "code": 302
    }
}
```

Property     | Response                            | Description
------------ | ----------------------------------- | ---------------
status       | error                               | Flag of the response
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful post:

```json
// post response
{
    "status": "success",
    "message": "Done updating"
}
```

Property     | Response             | Description
-----------  | -------------------- | --------------------------------
status       | success              | Flag of response
message      | Done updating        | Note
