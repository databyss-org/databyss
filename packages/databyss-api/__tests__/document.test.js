const helpers = require('./_helpers')

const {
  noAuthPost,
  createUser,
  deleteUserPosts,
  POST_EXAMPLE,
  getSourceNoAuthor,
  getEntryNoSource,
  createPage,
  getPage,
  getBlock,
  getPopulatedPage,
} = helpers

// RESOURCE
const RESOURCE = 'A book made for testing'

// USER
const EMAIL = 'email4@company.com'
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

    describe('adding page entities', () => {
      test('it should add a page state', async done => {
        const pageResponse = await createPage(token, POST_EXAMPLE)
        expect(pageResponse.statusCode).toBe(200)

        // TESTS SOURCES WERE CORRECTLY STORED
        const sources = Object.keys(POST_EXAMPLE.sources)
        const getSourceResponse = await getSourceNoAuthor(token, sources[0])
        const sourceResponse = JSON.parse(getSourceResponse.text)
        expect(sourceResponse.resource).toBe(
          POST_EXAMPLE.sources[sources[0]].rawHtml
        )
        // TESTS ENTRIES WERE CORRECTLY STORED
        const entries = Object.keys(POST_EXAMPLE.entries)
        const getEntryResponse = await getEntryNoSource(token, entries[0])
        const entryResponse = JSON.parse(getEntryResponse.text)
        expect(entryResponse.entry).toBe(
          POST_EXAMPLE.entries[entries[0]].rawHtml
        )

        // TESTS IF BLOCKS WERE CORRECTLY STORED
        const blocks = Object.keys(POST_EXAMPLE.blocks)
        const getBlockResponse = await getBlock(token, blocks[0])
        const blockResponse = JSON.parse(getBlockResponse.text)
        expect(blockResponse._id).toBe(blocks[0])
        expect(blockResponse.type).toBe(POST_EXAMPLE.blocks[blocks[0]].type)

        // TETS IF PAGE WAS CORRECTLY STORED
        const page = POST_EXAMPLE.page
        const { _id, name } = page
        const getPageResponse = await getPage(token, _id)
        const pageResponseTest = JSON.parse(getPageResponse.text)
        expect(pageResponseTest._id).toBe(_id)
        expect(pageResponseTest.name).toBe(name)

        // SHOULD RETURN POPULATED STATE
        const pageId = POST_EXAMPLE.page._id
        const getResponse = await getPopulatedPage(token, pageId)
        const res = JSON.parse(getResponse.text)
        expect(res.sources).toStrictEqual(POST_EXAMPLE.sources)
        expect(res.entries).toStrictEqual(POST_EXAMPLE.entries)

        done()
      })
    })

    afterAll(async done => {
      await deleteUserPosts(token)
      return done()
    })
  })
})
