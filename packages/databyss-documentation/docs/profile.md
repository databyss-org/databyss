---
id: profile
title: Profile 
sidebar_label: Profile
---

## Get current user's profile

Responds with current user profile information

### GET api/profile/me

#### Resource URL

```
http://localhost:5000/api/profile/me
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

    {"userId":"AAAA%2FAAA%3DAAAAAAAA"}

## Create or update user profile

### POST api/profile

#### Resource URL

```
http://localhost:5000/api/profile
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

| ID       | Required |     Type |   Description |
| -------- | :------: | -------: | ------------: |
| `school` | `false`  | `string` | user's school |

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"userId":"AAAA%2FAAA%3DAAAAAAAA"}

## Get all user profiles

Retrieves all user profiles

### GET api/profile

#### Resource URL

```
http://localhost:5000/api/profile
```

#### Resource Information

| []()             |
| ---------------- |
| Response formats | JSON |
| Access           | Public |

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    [{"userId":"AAAA%2FAAA%3DAAAAAAAA"}, ...]

## Get profile by user ID

Returns profile information for user ID

### GET api/profile/user/:user_id

#### Resource URL

```
http://localhost:5000/api/profile/user/:user_id
```

#### Resource Information

| []()             |
| ---------------- |
| Response formats | JSON |
| Access           | Public |

#### Response

    HTTP/1.1 200 OK
    Status: 200 OK
    Content-Type: application/json; charset=utf-8
    ...

    {"UserId":"AAAA%2FAAA%3DAAAAAAAA"}

## Delete profile

Delete profile, user & posts

### DELETE api/profile

#### Resource URL

```
http://localhost:5000/api/profile
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

    {"msg":"user deleted"}
