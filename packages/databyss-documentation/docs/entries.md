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
| `document`  |  `true`  | `string` |                                                                               raw text for entry |
| `_id`       | `false`  | `string` |                                                                  edit existing entry if provided |

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"entry":"entry text"... }

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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"entry":"entry text", ...}

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

    [{"entry":"entry text"...}, ...]
