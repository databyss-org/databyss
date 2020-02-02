import request from 'supertest'
import app from '../src/app'
import { send } from '../src/lib/sendgrid'

jest.mock('../src/lib/sendgrid')

export const noAuthPost = async resource =>
  request(await app())
    .post('/api/sources')
    .send({
      resource,
    })

export const getUserInfo = async token =>
  request(await app())
    .get('/api/profile/me')
    .set('x-auth-token', token)
    .send()

export const noAuthEntry = async entry =>
  request(await app())
    .post('/api/entries')
    .send({
      entry,
    })

export const noAuthAuthor = async (firstName, lastName) =>
  request(await app())
    .post('/api/authors')
    .send({
      firstName,
      lastName,
    })

export const createUser = async email => {
  let code
  send.mockImplementation(msg => {
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

export const createSourceNoAuthor = async (token, resource) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
    })

export const createAuthor = async (token, firstName, lastName) =>
  request(await app())
    .post('/api/authors')
    .set('x-auth-token', token)
    .send({
      firstName,
      lastName,
    })

export const getAuthor = async (token, authorId) =>
  request(await app())
    .get(`/api/authors/${authorId}`)
    .set('x-auth-token', token)

export const createEntryNoSource = async (token, entry) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
    })

export const getEntryNoSource = async (token, entryId) =>
  request(await app())
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

export const createEntryNewSource = async (token, entry, resource) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      resource,
    })

export const getEntryNewSource = async (token, entryId) =>
  request(await app())
    .get(`/api/entries/${entryId}`)
    .set('x-auth-token', token)

export const getSourceNoAuthor = async (token, sourceNoAuthorId) =>
  request(await app())
    .get(`/api/sources/${sourceNoAuthorId}`)
    .set('x-auth-token', token)

export const createSourceWithAuthor = async (token, resource, authorLastName) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      authorLastName,
    })

export const getSourceWithAuthor = async (token, sourceWithAuthorId) =>
  request(await app())
    .get(`/api/sources/${sourceWithAuthorId}`)
    .set('x-auth-token', token)

export const editedSourceWithAuthor = async (token, resource, _id) =>
  request(await app())
    .post(`/api/sources/`)
    .set('x-auth-token', token)
    .send({
      resource,
      _id,
    })

export const getEditedSourceWithAuthor = async (token, sourceId) =>
  request(await app())
    .get(`/api/sources/${sourceId}`)
    .set('x-auth-token', token)

export const deleteUserPosts = async token =>
  request(await app())
    .del(`/api/profile/`)
    .set('x-auth-token', token)

export const createSourceWithId = async (token, resource, sourceId) =>
  request(await app())
    .post('/api/sources')
    .set('x-auth-token', token)
    .send({
      resource,
      _id: sourceId,
    })

export const createEntryWithId = async (token, entry, entryId) =>
  request(await app())
    .post('/api/entries')
    .set('x-auth-token', token)
    .send({
      entry,
      _id: entryId,
    })

export const createPage = async (token, accountId, data) =>
  request(await app())
    .post('/api/pages')
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

    .send({
      data,
    })

export const getPage = async (token, accountId, _id) =>
  request(await app())
    .get(`/api/pages/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

export const createBlock = async (token, _id, type, refId) =>
  request(await app())
    .post('/api/blocks')
    .set('x-auth-token', token)
    .send({
      type,
      refId,
      _id,
    })

export const getBlock = async (token, _id) =>
  request(await app())
    .get(`/api/blocks/${_id}`)
    .set('x-auth-token', token)

export const getPopulatedPage = async (token, accountId, _id) =>
  request(await app())
    .get(`/api/pages/populate/${_id}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)

export const newAccountWithUserId = async token =>
  request(await app())
    .post('/api/accounts')
    .set('x-auth-token', token)
    .send()

export const addUserToAccount = async (token, _id, userId, role) =>
  request(await app())
    .post(`/api/accounts/user/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', _id)
    .send({
      role,
    })

export const deleteUserFromAccount = async (token, accountId, userId) =>
  request(await app())
    .delete(`/api/accounts/${userId}`)
    .set('x-auth-token', token)
    .set('x-databyss-account', accountId)
