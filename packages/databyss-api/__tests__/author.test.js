const request = require('supertest')
const app = require('./../app')
const { globalSetup, globalTeardown } = require('./../serverSetup')
// const globalTeardown = require('./../serverSetup')
const { dropDB } = require('./../config/db')

//const disconnectDB = require('./../config/db/')

//globalSetup()

// AUTH
const email = 'email@company.com'
const password = 'password'
//let token

// AUTHOR
const firstName = 'John'
const lastName = 'Doe'
// let authorId

// SOURCE
const resource = 'A book title'
// let authors = [authorId]
// let sourceId

// ENTRY
let entry = 'this is my first entry'
// let entryId

beforeAll(async done => {
  await globalSetup()
  done()
})

// CREATE ACCOUNT
describe('Creates Account and logs user in to create new author', () => {
  let token
  let authorId
  let authors
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
      .post('/api/authors')
      .send({
        firstName: firstName,
        lastName: lastName,
      })
      .then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
  })

  test('It should post new author', done => {
    request(app)
      .post('/api/authors')
      .set('x-auth-token', token)
      .send({
        firstName: firstName,
        lastName: lastName,
      })
      .then(response => {
        authorId = JSON.parse(response.text)._id
        authors = [authorId]
        expect(response.statusCode).toBe(200)
        done()
      })
  })
  test('It should require Authorization', done => {
    request(app)
      .get(`/api/authors/${authorId}`)
      .then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
  })
  test('It should retreive author by ID', done => {
    request(app)
      .get(`/api/authors/${authorId}`)
      .set('x-auth-token', token)
      .then(response => {
        const res = JSON.parse(response.text).firstName
        expect(res).toBe(firstName)
        done()
      })
  })
  test('It should require Authorization', done => {
    request(app)
      .get('/api/authors')
      .then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
  })
  test('It should get all authors', done => {
    request(app)
      .get('/api/authors')
      .set('x-auth-token', token)
      .then(response => {
        const authors = JSON.parse(response.text)
        expect(Array.isArray(authors)).toBe(true)
        expect(authors.length).toBe(1)
        done()
      })
  })
})

afterAll(async done => {
  await dropDB()
  await globalTeardown()
  done()
})
