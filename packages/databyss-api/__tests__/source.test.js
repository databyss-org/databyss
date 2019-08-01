const helpers = require('./_helpers')

const {
  noAuthPost,
  createUser,
  createSourceNoAuthor,
  getSourceNoAuthor,
  createSourceWithAuthor,
  getSourceWithAuthor,
  editedSourceWithAuthor,
  getEditedSourceWithAuthor,
  deleteUserPosts,
} = helpers

// RESOURCE
const RESOURCE = 'A book made for testing'
const EDITED_RESOURCE = 'A book made for editing'
const AUTHOR_LAST_NAME = 'Best Selling'

// USER
const EMAIL = 'email@company.com'
const PASSWORD = 'password'

// CREATE ACCOUNT
describe('Source', () => {
  describe('Not authorized', () => {
    test('Create should require Authorization', async done => {
      noAuthPost(RESOURCE).then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
    })
  })

  describe('Authorized', () => {
    let token
    beforeAll(async done => {
      token = await createUser(EMAIL, PASSWORD)
      done()
    }, 5000)

    test('It should post/get new source with no author', async () => {
      const postResponse = await createSourceNoAuthor(token, RESOURCE)
      const sourceNoAuthorId = JSON.parse(postResponse.text)._id
      expect(postResponse.statusCode).toBe(200)
      const getResponse = await getSourceNoAuthor(token, sourceNoAuthorId)
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(RESOURCE)
      expect(res.authors.length).toBe(0)
    })

    test('It should post/get new source with author', async () => {
      const postResponse = await createSourceWithAuthor(
        token,
        RESOURCE,
        AUTHOR_LAST_NAME
      )
      const sourceWithAuthorId = JSON.parse(postResponse.text)._id
      expect(postResponse.statusCode).toBe(200)

      const getResponse = await getSourceWithAuthor(token, sourceWithAuthorId)
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(RESOURCE)
      expect(res.authors.length).toBeGreaterThan(0)
    })

    test('It should edit a source by ID', async () => {
      const createResponse = await createSourceNoAuthor(token, RESOURCE)
      const sourceNoAuthorId = JSON.parse(createResponse.text)._id
      const editResponse = await editedSourceWithAuthor(
        token,
        EDITED_RESOURCE,
        sourceNoAuthorId
      )
      expect(editResponse.statusCode).toBe(200)
      const getResponse = await getEditedSourceWithAuthor(
        token,
        sourceNoAuthorId
      )
      const res = JSON.parse(getResponse.text)
      expect(res.resource).toBe(EDITED_RESOURCE)
    })
    afterAll(async done => {
      await deleteUserPosts()
      return done()
    })
  })
})
