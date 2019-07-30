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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"lastName":"AAAA%2FAAA%3DAAAAAAAA"}

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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"firstName":"AAAA%2FAAA%3DAAAAAAAA", ...}

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

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    [{"firstName":"AAAA%2FAAA%3DAAAAAAAA"...}, ...]
