const request = require('supertest')
const app = require('../src/app')
const sendgrid = require('../src/lib/sendgrid')

jest.mock('../src/lib/sendgrid')

exports.noAuthPost = async resource =>
  request(await app())
    .post('/api/sources')
    .send({
      resource,
    })

exports.getUserInfo = async token =>
  request(await app())
    .get('/api/profile/me')
    .set('x-auth-token', token)
    .send()

exports.noAuthEntry = async entry =>
  request(await app())
    .post('/api/entries')
    .send({
      entry,
    })

exports.noAuthAuthor = async (firstName, lastName) =>
  request(await app())
    .post('/api/authors')
    .send({
      firstName,
      lastName,
    })

exports.createUser = async email => {
  let code
  sendgrid.send.mockImplementation(msg => {
    code = msg.dynamic_template_data.code
  })

  await request(await app())
    .post('/api/users/email')
    .send({ email })

  const response = await request(await app())
    .post('/api/auth/code')
    .send({ code })

  return JSON.parse(response.text).data.session.token
}

exports.createSourceNoAuthor = async (token, resource) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
    })

exports.createAuthor = async (token, firstName, lastName) =>
  request(await app())
    .post('/api/authors')
    .set('x-auth-token', token)
    .send({
      firstName,
      lastName,
    })

exports.getAuthor = async (token, authorId) =>
  request(await app())
    .get(`/api/authors/${authorId}`)
    .set('x-auth-token', token)

exports.createEntryNoSource = async (token, entry) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
    })

exports.getEntryNoSource = async (token, entryId) =>
  request(await app())
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.createEntryNewSource = async (token, entry, resource) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      resource,
    })

exports.getEntryNewSource = async (token, entryId) =>
  request(await app())
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

exports.getSourceNoAuthor = async (token, sourceNoAuthorId) =>
  request(await app())
    .get(`/api/sources/${sourceNoAuthorId}`)
    .set('x-auth-token', token)

exports.createSourceWithAuthor = async (token, resource, authorLastName) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      authorLastName,
    })

exports.getSourceWithAuthor = async (token, sourceWithAuthorId) =>
  request(await app())
    .get(`/api/sources/${sourceWithAuthorId}`)
    .set('x-auth-token', token)

exports.editedSourceWithAuthor = async (token, resource, _id) =>
  request(await app())
    .post(`/api/sources/`)
    .set('x-auth-token', token)
    .send({
      resource,
      _id,
    })

exports.getEditedSourceWithAuthor = async (token, sourceId) =>
  request(await app())
    .get(`/api/sources/${sourceId}`)
    .set('x-auth-token', token)

exports.deleteUserPosts = async token =>
  request(await app())
    .del(`/api/profile/`)
    .set('x-auth-token', token)

exports.createSourceWithId = async (token, resource, sourceId) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      _id: sourceId,
    })

exports.createEntryWithId = async (token, entry, entryId) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      _id: entryId,
    })

exports.createPage = async (token, accountId, data) =>
  request(await app())
    .post('/api/pages')
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

    .send({
      data,
    })

exports.getPage = async (token, accountId, _id) =>
  request(await app())
    .get(`/api/pages/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

exports.createBlock = async (token, _id, type, refId) =>
  request(await app())
    .post('/api/blocks')
    .set('x-auth-token', token)
    .send({
      type,
      refId,
      _id,
    })

exports.getBlock = async (token, _id) =>
  request(await app())
    .get(`/api/blocks/${_id}`)
    .set('x-auth-token', token)

exports.getPopulatedPage = async (token, accountId, _id) =>
  request(await app())
    .get(`/api/pages/populate/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

exports.newAccountWithUserId = async token =>
  request(await app())
    .post('/api/accounts')
    .set('x-auth-token', token)
    .send()

exports.addUserToAccount = async (token, _id, userId, role) =>
  request(await app())
    .post(`/api/accounts/user/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', _id)
    .send({
      role,
    })

exports.deleteUserFromAccount = async (token, accountId, userId) =>
  request(await app())
    .delete(`/api/accounts/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)
