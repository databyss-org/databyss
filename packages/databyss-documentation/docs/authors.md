---
id: authors
title: Authors API
sidebar_label: Authors
---

## Adds or updates author

Adds new author or edits author if `_id` is provided.

### POST api/authors

#### Resource URL

```
http://localhost:5000/api/authors
```

#### Resource Information

| []()             |
| ---------------- |
| Response formats | JSON |
| Access           | Private |

#### Headers

| ID             | Required |     Type |  Description |
| -------------- | :------: | -------: | -----------: |
| `x-auth-token` |  `true`  | `string` | access token |

#### Body Parameters

| ID          | Required |     Type |                                 Description |
| ----------- | :------: | -------: | ------------------------------------------: |
| `lastName`  |  `true`  | `string` |                         authors's last name |
| `firstName` | `false`  | `string` |                        authors's first name |
| `entries`   | `false`  |  `array` |  array of entry ID's containing this author |
| `sources`   | `false`  |  `array` | array of source ID's containing this author |
| `_id`       | `false`  | `string` |                        edit existing author |

#### Example Request

    POST /api/authors HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "firstName":"William",
        "lastName":"Shakespeare"
    }

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {
        "entries": [],
        "default": false,
        "sources": [],
        "_id": "5d4341c5294d454f4a715e2b",
        "firstName": "William",
        "lastName": "Shakespeare",
        "user": "xxxxxxxxxxxxxx",
        "__v": 0
    }

## Get author by ID

Retrieve author information by providing an `id` in the URL, only returns authors added by the user

### GET api/authors/:id

#### Resource URL

```
http://localhost:5000/api/authors/:id
```

#### Resource Information

| []()             |
| ---------------- |
| Response formats | JSON |
| Access           | Private |

#### Headers

| ID             | Required |     Type |  Description |
| -------------- | :------: | -------: | -----------: |
| `x-auth-token` |  `true`  | `string` | access token |

#### Example Request

    GET /api/authors/5d4341c5294d454f4a715e2b HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {
        "entries": [],
        "default": false,
        "sources": [],
        "_id": "5d4341c5294d454f4a715e2b",
        "firstName": "William",
        "lastName": "Shakespeare",
        "user": "xxxxxxxxxxxxxx",
        "__v": 0
    }

## Gets all authors

Retrieves all authors added by user

### GET api/authors/

#### Resource URL

```
http://localhost:5000/api/authors/
```

#### Resource Information

| []()             |
| ---------------- |
| Response formats | JSON |
| Access           | Private |

#### Headers

| ID             | Required |     Type |  Description |
| -------------- | :------: | -------: | -----------: |
| `x-auth-token` |  `true`  | `string` | access token |

#### Example Request

    GET /api/authors/ HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    [
        {
            "entries": [
                {
                    "_id": "5d432e682b6e123520577a02",
                    "entry": "It was the best of times..."
                }
            ],
            "default": false,
            "sources": [
                {
                    "_id": "5d432e682b6e123520577a01",
                    "resource": "Tale of Two"
                }
            ],
            "_id": "5d432e682b6e123520577a00",
            "firstName": "Charles",
            "lastName": "Dickens",
            "user": "5d4300b697ebbb06300e78b2",
            "__v": 0
        },
    ...
    ]
