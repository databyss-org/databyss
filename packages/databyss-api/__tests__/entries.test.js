const request = require('supertest')
const app = require('./../app')
const { globalSetup, globalTeardown } = require('./../serverSetup')
const { dropDB } = require('./../config/db')

// AUTH
const email = 'email@company.com'
const password = 'password'
//let token

// RESOURCE
const entry = 'Testing an entry'
const entryWithSource = 'this is a source entry'
const source = 'this is the source'

beforeAll(async done => {
  await globalSetup()
  done()
})

describe('Creates Account and logs user in to create new entry', () => {
  let token
  let newEntryId
  let entryWithSourceId
  let sourceId
  beforeAll(done => {
    request(app)
      .post('/api/users')
      .send({
        name: 'joe',
        password: password,
        email: email,
      })
      .then(response => {
        token = JSON.parse(response.text).token
        done()
      })
  })
  test('It should require Authorization', done => {
    request(app)
      .post('/api/entries')
      .send({
        entry: entry,
      })
      .then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
  })

  test('It should post new entry with no source or author', done => {
    request(app)
      .post('/api/entries')
      .set('x-auth-token', token)
      .send({
        entry: entry,
      })
      .then(response => {
        newEntryId = JSON.parse(response.text)._id
        expect(response.statusCode).toBe(200)
        done()
      })
  })
  test('It should retreive entry by ID with no sourece or author', done => {
    request(app)
      .get(`/api/entries/${newEntryId}`)
      .set('x-auth-token', token)
      .then(response => {
        const res = JSON.parse(response.text)
        expect(res.entry).toBe(entry)
        done()
      })
  })
  test('It should post new entry with new source', done => {
    request(app)
      .post('/api/entries')
      .set('x-auth-token', token)
      .send({
        entry: entryWithSource,
        resource: source,
      })
      .then(response => {
        const res = JSON.parse(response.text)
        entryWithSourceId = res._id
        sourceId = res.source
        // sourcesWithAuthor = [sourceWithAuthorId]
        expect(response.statusCode).toBe(200)
        done()
      })
  })

  test('It should retreive entry by ID with source', done => {
    request(app)
      .get(`/api/entries/${entryWithSourceId}`)
      .set('x-auth-token', token)
      .then(response => {
        const res = JSON.parse(response.text)
        expect(res.entry).toBe(entryWithSource)
        expect(res.source).toBe(sourceId)
        done()
      })
  })
})

afterAll(async done => {
  await dropDB()
  await globalTeardown()
  done()
})
