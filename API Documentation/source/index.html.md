---
title: IAP API Reference

language_tabs:
  - shell
  - javascript

toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>

includes:
  - errors

search: true
---

# Introduction

Welcome to the IAP API! You can use our API to access IAP API endpoints, which can get information on QA, user profile, server status... from the IAP system.

We have language bindings in Shell and Javascript! You can view code examples in the dark area to the right, and you can switch the programming language of the examples with the tabs in the top right.

# Authentication

> To authorize, use this code:

```shell
# With shell, you can just pass the correct header with each request
curl "intelligent-student-advisor.herokuapp.com/api/account/login"
  -H "Authorization: xxxxxxxxx"
```

```javascript
const IAA = require('intelligent-student-advisor');

let api = IAA.authorize({'Authorization': 'xxxxxxxxx'});
```

> Make sure to replace `xxxxxxxxx` with your API key.

IAP uses API keys to allow access to the API. You can register a new IAP API key at our [developer portal](http://intelligent-student-advisor.herokuapp.com/developers).

IAP expects for the API key to be included in all API requests to the server in a header that looks like the following:

`Authorization: xxxxxxxxx`

<aside class="notice">
You must replace <code>xxxxxxxxx</code> with your personal API key.
</aside>

# API

## Profile

```shell
curl "http://intelligent-student-advisor.herokuapp.com/api/profile"
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

This endpoint interact with user's profile information.

### HTTP Request

`GET http://example.com/api/kittens`

### Query Parameters

Parameter | Default | Description
--------- | ------- | -----------
include_cats | false | If set to true, the result will also include cats.
available | true | If set to false, the result will include kittens that have already been adopted.

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
--------- | -----------
ID | The ID of the kitten to retrieve
