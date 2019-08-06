const request = require('supertest')
const app = require('./../app')

exports.noAuthPost = resource =>
  request(app)
    .post('/api/sources')
    .send({
      resource,
    })

exports.noAuthEntry = entry =>
  request(app)
    .post('/api/entries')
    .send({
      entry,
    })

exports.noAuthAuthor = (firstName, lastName) =>
  request(app)
    .post('/api/authors')
    .send({
      firstName,
      lastName,
    })

exports.createUser = async (email, password) => {
  let response = await request(app)
    .post('/api/users')
    .send({
      name: 'joe',
      password,
      email,
    })

  if (response.status === 400) {
    response = await request(app)
      .post('/api/auth')
      .send({
        password,
        email,
      })
  }
  return JSON.parse(response.text).token
}

exports.createSourceNoAuthor = (token, resource) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
    })

exports.createAuthor = (token, firstName, lastName) =>
  request(app)
    .post('/api/authors')
    .set('x-auth-token', token)
    .send({
      firstName,
      lastName,
    })

exports.getAuthor = (token, authorId) =>
  request(app)
    .get(`/api/authors/${authorId}`)
    .set('x-auth-token', token)

exports.createEntryNoSource = (token, entry) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
    })

exports.getEntryNoSource = (token, entryId) =>
  request(app)
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.createEntryNewSource = (token, entry, resource) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      resource,
    })

exports.getEntryNewSource = (token, entryId) =>
  request(app)
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.getSourceNoAuthor = async (token, sourceNoAuthorId) =>
  request(app)
    .get(`/api/sources/${sourceNoAuthorId}`)
    .set('x-auth-token', token)

exports.createSourceWithAuthor = (token, resource, authorLastName) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      authorLastName,
    })

exports.getSourceWithAuthor = async (token, sourceWithAuthorId) =>
  request(app)
    .get(`/api/sources/${sourceWithAuthorId}`)
    .set('x-auth-token', token)

exports.editedSourceWithAuthor = (token, resource, _id) =>
  request(app)
    .post(`/api/sources/`)
    .set('x-auth-token', token)
    .send({
      resource,
      _id,
    })

exports.getEditedSourceWithAuthor = (token, sourceId) =>
  request(app)
    .get(`/api/sources/${sourceId}`)
    .set('x-auth-token', token)

exports.deleteUserPosts = token =>
  request(app)
    .del(`/api/profile/`)
    .set('x-auth-token', token)
