import { createUser, createSourceNoAuthor } from './_helpers'

const request = require('supertest')
const app = require('./../app')
const { globalSetup, globalTeardown } = require('./../serverSetup')
const { dropDB } = require('./../config/db')
// let token

// RESOURCE
const RESOURCE = 'A book made for testing'
const EDITED_RESOURCE = 'A book made for editing'
const AUTHOR_LAST_NAME = 'Best Selling'

beforeAll(async done => {
  await globalSetup()
  done()
})

// CREATE ACCOUNT
describe('Source', () => {
  describe('Not authorized', () => {
    test('Create should require Authorization', done => {
      request(app)
        .post('/api/sources')
        .send({
          resource: RESOURCE,
        })
        .then(response => {
          expect(response.statusCode).toBe(401)
          done()
        })
    })
  })

  describe('Authorized', () => {
    let token
    beforeAll(async () => {
      token = await createUser()
    })

    test('It should post/get new source with no author', async () => {
      const postResponse = await createSourceNoAuthor(token, RESOURCE)
      const sourceNoAuthorId = JSON.parse(postResponse.text)._id
      expect(postResponse.statusCode).toBe(200)

      const getResponse = await request(app)
        .get(`/api/sources/${sourceNoAuthorId}`)
        .set('x-auth-token', token)
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(RESOURCE)
      expect(res.authors.length).toBe(0)
    })

    test('It should post/get new source with author', async () => {
      const postResponse = await request(app)
        .post('/api/sources')
        .set('x-auth-token', token)
        .send({
          resource: RESOURCE,
          AUTHOR_LAST_NAME,
        })
      const sourceWithAuthorId = JSON.parse(postResponse.text)._id
      expect(postResponse.statusCode).toBe(200)

      const getResponse = await request(app)
        .get(`/api/sources/${sourceWithAuthorId}`)
        .set('x-auth-token', token)
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(RESOURCE)
      expect(res.authors.length).toBeGreaterThan(0)
    })

    test('It should edit a source by ID', async () => {
      const createResponse = await createSourceNoAuthor(token, RESOURCE)
      const sourceNoAuthorId = JSON.parse(createResponse.text)._id

      const editResponse = await request(app)
        .post(`/api/sources/`)
        .set('x-auth-token', token)
        .send({
          resource: EDITED_RESOURCE,
          _id: sourceNoAuthorId,
        })
      expect(editResponse.statusCode).toBe(200)

      const getResponse = await request(app)
        .get(`/api/sources/${sourceNoAuthorId}`)
        .set('x-auth-token', token)
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(EDITED_RESOURCE)
    })
  })
})

afterAll(async done => {
  await dropDB()
  await globalTeardown()
  done()
})
