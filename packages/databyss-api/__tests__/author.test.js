const helpers = require('./_helpers')

const {
  noAuthAuthor,
  createUser,
  createAuthor,
  getAuthor,
  deleteUserPosts,
} = helpers

// AUTHOR
const FIRST_NAME = 'John'
const LAST_NAME = 'Doe'

// USER
const EMAIL = 'email2@company.com'
const PASSWORD = 'password2'

describe('Author', () => {
  describe('Not authorized', () => {
    test('Create should require Authorization', async done => {
      noAuthAuthor(FIRST_NAME, LAST_NAME).then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
    })
  })
})

describe('Authorized', () => {
  let token
  beforeAll(async done => {
    token = await createUser(EMAIL, PASSWORD)
    done()
  }, 5000)
  test('It should post/get new author', async () => {
    let newAuthorId
    await createAuthor(token, FIRST_NAME, LAST_NAME).then(response => {
      newAuthorId = JSON.parse(response.text)._id
      expect(response.statusCode).toBe(200)
    })
    await getAuthor(token, newAuthorId).then(response => {
      const res = JSON.parse(response.text).firstName
      expect(res).toBe(FIRST_NAME)
    })
    afterAll(async done => {
      await deleteUserPosts()
      done()
    })
  })
})
