---
id: sources
title: Sources API
sidebar_label: Sources
---

## Add or update source

Adds new source or edits source if `_id` is provided.

### POST api/sources

#### Resource URL

```
http://localhost:5000/api/sources
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

| ID                  | Required |     Type |                                                                                    Description |
| ------------------- | :------: | -------: | ---------------------------------------------------------------------------------------------: |
| `resource`          |  `true`  | `string` |                                                                       main resource title text |
| `entries`           | `false`  |  `array` |                                                     array of entry ID's containing this source |
| `authors`           | `false`  |  `array` |                                                    array of author ID's containing this source |
| `title`             | `false`  |  `array` |                                                                                title of source |
| `abbreviation`      | `false`  | `string` |                                                                         abbreviation of source |
| `publishingCompany` | `false`  | `string` |                                                                  company that published source |
| `city`              | `false`  | `string` |                                                                  city source was plublished in |
| `sourceType`        | `false`  | `string` |                                                                 source type (`link`, `book`..) |
| `url`               | `false`  | `string` |                                                                                link for source |
| `files`             | `false`  |  `array` |                                                         array of files attached to this source |
| `date`              | `false`  |  `array` |                                                                          date source published |
| `_id`               | `false`  | `string` |                                                             if included, edits existing source |
| `authorFirstName`   | `false`  | `string` |                                          if included, creates new author and appends source ID |
| `authorLastName`    | `false`  | `string` | if included, creates new author and appends source ID (last name is required to add new author |

#### Example Request (no author)

    POST /api/sources HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "resource": " A book title",
        "date": "2002",
        "city": "new york",
        "sourceType": "book",
        "url": "google.com"
    }

#### Example Request (with author)

    POST /api/sources HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

    {
        "resource": " A book title",
        "date": "2002",
        "city": "new york",
        "sourceType": "book",
        "url": "google.com"
        "authorFirstName": "William",
        "authorLastName": "Shakespeare"
    }

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {
        "authors": [
            "5d4334ccf210f44181018fbb"
        ],
        "default": false,
        "files": [],
        "entries": [],
        "_id": "5d4334ccf210f44181018fbc",
        "abbreviation": "",
        "city": "new york",
        "publishingCompany": "",
        "sourceType": "book",
        "url": "google.com",
        "date": "2002",
        "resource": " A book title",
        "user": "xxxxxxxxxxxxxxx",
        "__v": 0
    }

## Get source by id

Retrieve source information by providing an `id` in the URL, only returns sources added by the user

### GET api/sources/:id

#### Resource URL

```
http://localhost:5000/api/sources/:id
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

    GET /api/sources/5d4334ccf210f44181018fbc HTTP/1.1
    Host: localhost:5000
    Content-Type: application/json
    x-auth-token: xxxxxxxxxxxxxxx

#### Example Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {
        "authors": [
            {
                "_id": "5d4334ccf210f44181018fbb",
                "firstName": "William",
                "lastName": "Shakespeare"
            }
        ],
        "default": false,
        "files": [],
        "entries": [],
        "_id": "5d4334ccf210f44181018fbc",
        "abbreviation": "",
        "city": "new york",
        "publishingCompany": "",
        "sourceType": "book",
        "url": "google.com",
        "date": "2002",
        "resource": " A book title",
        "user": "xxxxxxxxxxxxxxx",
        "__v": 0
    }

## Get all sources

Retrieves all sources added by user

### GET api/sources/

#### Resource URL

```
http://localhost:5000/api/sources/
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

    GET /api/sources/ HTTP/1.1
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
            "authors": [
                {
                    "_id": "5d432e682b6e123520577a00",
                    "firstName": "Charles",
                    "lastName": "Dickens"
                }
            ],
            "default": false,
            "files": [],
            "entries": [
                {
                    "_id": "5d432e682b6e123520577a02",
                    "entry": "It was the best of times..."
                }
            ],
            "_id": "5d432e682b6e123520577a01",
            "resource": "Tale of Two",
            "user": "5d4300b697ebbb06300e78b2",
            "__v": 0
        },
    ...
    ]
