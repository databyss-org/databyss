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

exports.createSourceWithId = (token, resource, sourceId) =>
  request(app)
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      _id: sourceId,
    })

exports.createEntryWithId = (token, entry, entryId) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      _id: entryId,
    })

exports.createPage = (token, data) =>
  request(app)
    .post('/api/pages')
    .set('x-auth-token', token)
    .send({
      data,
    })

exports.getPage = (token, _id) =>
  request(app)
    .get(`/api/pages/${_id}`)
    .set('x-auth-token', token)

exports.createBlock = (token, _id, type, refId) =>
  request(app)
    .post('/api/blocks')
    .set('x-auth-token', token)
    .send({
      type,
      refId,
      _id,
    })

exports.getBlock = (token, _id) =>
  request(app)
    .get(`/api/blocks/${_id}`)
    .set('x-auth-token', token)

exports.getPopulatedPage = (token, _id) =>
  request(app)
    .get(`/api/pages/populate/${_id}`)
    .set('x-auth-token', token)

export const POST_EXAMPLE = {
  sources: {
    '5d64419f1cbc815583c35058': {
      _id: '5d64419f1cbc815583c35058',
      rawHtml: 'Staminov, Lev. Conscious and Embodiment',
    },
  },
  entries: {
    '5d6442046e84d304ddceb768': {
      _id: '5d6442046e84d304ddceb768',
      rawHtml: 'Mind as homunculus ins body',
    },
  },
  blocks: {
    '5d64423aae2da21680dc208b': {
      type: 'SOURCE',
      _id: '5d64423aae2da21680dc208b',
      refId: '5d64419f1cbc815583c35058',
    },
    '5d64424bcfa313f70483c1b0': {
      type: 'ENTRY',
      _id: '5d64424bcfa313f70483c1b0',
      refId: '5d6442046e84d304ddceb768',
    },
  },
  page: {
    _id: '5d6443bdd9ca9149d1a346c2',
    name: 'pauls document',
    blocks: [
      {
        _id: '5d64423aae2da21680dc208b',
      },
      {
        _id: '5d64424bcfa313f70483c1b0',
      },
    ],
  },
}
