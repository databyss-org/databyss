---
id: entries
title: Entries API
sidebar_label: Entries
---

## Add or update entry

Adds new entry or edits entry if `_id` is provided.

### POST api/entry

#### Resource URL

```
http://localhost:5000/api/entry
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

| ID          | Required |     Type |                                                                                      Description |
| ----------- | :------: | -------: | -----------------------------------------------------------------------------------------------: |
| `entry`     |  `true`  | `string` |                                                                                  main entry text |
| `pageFrom`  | `false`  | `string` |                                                                          page where entry starts |
| `pageTo`    | `false`  | `string` |                                                                            page where entry ends |
| `files`     | `false`  |  `array` |                                                        array of files associated with this entry |
| `index`     | `false`  | `string` |                                        index value of entry if multiple entries on the same page |
| `resource`  | `false`  | `string` |                                       if provided, adds a new source and appends the ID to entry |
| `firstName` | `false`  | `string` |                                       if provided, adds a new author and appends the ID to entry |
| `lastName`  | `false`  | `string` | if provided, adds a new author and appends the ID to entry, `lastName` is required for new entry |
| `author`    | `false`  |  `array` |                                                     array of author ID's contained in this entry |
| `source`    | `false`  | `string` |                                                              source ID's contained in this entry |
| `_id`       | `false`  | `string` |                                                                  edit existing entry if provided |

#### Example Request (no author, no source)

    POST /api/entries HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "entry": "It was the best of times...",
        "pageFrom": 20
    }

#### Example Request (new source)

    POST /api/entries HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "entry": "It was the best of times...",
        "pageFrom": 20,
        "resource": "Tale of Two"
    }

#### Example Request (new source, new author)

    POST /api/entries HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "entry": "It was the best of times...",
        "pageFrom": 20,
        "resource": "Tale of Two",
        "lastName": "Dickens",
        "firstName": "Charles"
    }

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8

    {
    "author": [
        "5d4313a8d9bc931a27a84ec6"
    ],
    "default": false,
    "files": [],
    "index": 0,
    "_id": "5d4313a8d9bc931a27a84ec8",
    "pageFrom": 20,
    "source": "5d4313a8d9bc931a27a84ec7",
    "pageTo": -1,
    "entry": "It was the best of times...",
    "user": "xxxxxxxxxxxxxxx",
    "__v": 0
    }

## Get entry by id

Retrieve entry information by providing an `id` in the URL, only returns entries added by the user

### GET api/entry/:id

#### Resource URL

```
http://localhost:5000/api/entry/:id
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

    GET /api/entries/5d4313a8d9bc931a27a84ec8 HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {
        "author": [
            {
                "_id": "5d432d6bfd4c6634364d5c4c",
                "firstName": "Charles",
                "lastName": "Dickens"
            }
        ],
        "default": false,
        "files": [],
        "index": 0,
        "_id": "5d432d6bfd4c6634364d5c4e",
        "pageFrom": 20,
        "source": {
            "_id": "5d432d6bfd4c6634364d5c4d",
            "resource": "Tale of Two"
        },
        "pageTo": -1,
        "entry": "It was the best of times...",
        "user": "xxxxxxxxxxxxxxx",
        "__v": 0
    }

## Get all entries

Retrieves all entries added by user

### GET api/entries/

#### Resource URL

```
http://localhost:5000/api/entries/
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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    [
        {
            "author": [
                {
                "_id": "5d432d6bfd4c6634364d5c4c",
                "firstName": "Charles",
                "lastName": "Dickens"
                }
            ],
            "default": false,
            "files": [],
            "index": 0,
            "_id": "5d432d6bfd4c6634364d5c4e",
            "pageFrom": 20,
            "source": {
                "_id": "5d432d6bfd4c6634364d5c4d",
                "resource": "Tale of Two"
                },
            "pageTo": -1,
            "entry": "It was the best of times...",
            "user": "xxxxxxxxxxxxxxx",
            "__v": 0
        }
    ...
    ]
