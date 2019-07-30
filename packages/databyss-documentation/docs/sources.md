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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"resource":"AAAA%2FAAA%3DAAAAAAAA"...}

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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"resource":"AAAA%2FAAA%3DAAAAAAAA", ...}

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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    [{"resources":"AAAA%2FAAA%3DAAAAAAAA"...}, ...]
