# Status

## Total Trained Questions

### HTTP Request

`GET /get-status`

> To get total trained questions count:

```javascript
  fetch("../status/get-status", {
    method: 'get'
  })then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```

### The API doesn't require any parameter
</br>
</br>
</br>
</br>
</br>
</br>
</br>
</br>
</br>


### Example response of successful response:

```json
{
    "status": "good",
    "trainedQuestionCount": 352
}
```

Property | Description
-------- | -----------------
status   | Show login status
trainedQuestionCount  | How many questions were trained in the system

## Developer Team Information

### HTTP Request

`GET /team-member`

</br>

> To get list of developer information:

```javascript
  fetch("../status/team-member", {
    method: 'get'
  })then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```

### The API doesn't require any parameter
</br>
</br>
</br>
</br>
</br>
</br>
</br>
</br>
</br>


### Example response of successful response:

```json
[
  {
    "link":"...",
    "description":"...",
    "avatar":"...",
    "name":"...",
    "__v":0,
    "main-title":["...","...",...],
    "skill":["...","...",...]
  },
  {...},
  ...
]
```

Property | Description
-------- | -----------------
name   | Developer's name
avatar | Developer's avatar
description | Short description text about the developer
main-title | Array of roles and team titles of this developer
link | Preferred public link of the developer
skill | Array of skills that the developer used during development

### HTTP Request

`POST /team-member`

> To post developer information to the server:

```javascript


  fetch("../status/team-member", {
    method: 'post',
    body:{
          	"name":"...",
          	"skill":["...", "...", "...", "...",
          	"description":"...",
          	"link":"...",
          	"avatar":"...",
          	"main-title":["...","...","...","...","...","...","..."],
          	"adminCode":"..."
          }
  })then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });



```

### The API requires 1 parameter

Parameter | Description
-------- | -----------------
body   | A json object string of developer's information

Property | Description
-------- | -----------------
name   | Developer's name
avatar | Developer's avatar
description | Short description text about the developer
main-title | Array of roles and team titles of this developer
link | Preferred public link of the developer
skill | Array of skills that the developer used during development
adminCode | Operation token for posting and deleting on server

### Example response of successful response:

> Updated new developer record:

```json
[
  {
    "_id": "...",
    "link":"...",
    "description":"...",
    "avatar":"...",
    "name":"...",
    "__v":0,
    "main-title":["...","...",...],
    "skill":["...","...",...]
  }
]
```

Property | Description
-------- | -----------------
name   | Developer's name
avatar | Developer's avatar
description | Short description text about the developer
main-title | Array of roles and team titles of this developer
link | Preferred public link of the developer
skill | Array of skills that the developer used during development

</br>
</br>
</br>
</br>

### HTTP Request

`DELETE /team-member`

> To post developer information to the server:

```javascript
  fetch("../status/team-member", {
    method: 'delete',
    body:{
          "name":"...",
          "adminCode":"..."
          }
  })then(response=>{return response.json()})
  .then(json=> {
    // response message will be in json
  });
```

### The API requires 1 parameter

Parameter | Description
-------- | -----------------
body   | A json object string of developer's information

Property | Description
-------- | -----------------
name   | Developer's name
adminCode | Operation token for posting and deleting on server

</br>

### Example response of successful response:

> Updated new developer record:

```json
{
    "status": "Successfully delete record"
}
```
</br>

Property | Description
-------- | -----------------
status   | Operation result
