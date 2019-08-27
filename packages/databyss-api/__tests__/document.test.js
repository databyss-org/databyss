const helpers = require('./_helpers')
const {
  getSourcesFromBlocks,
  getEntriesFromBlocks,
} = require('./../routes/api/helpers/entriesHelper')

const {
  noAuthPost,
  createUser,
  createSourceWithId,
  deleteUserPosts,
  POST_EXAMPLE,
  getSourceNoAuthor,
  createEntryWithId,
  getEntryNoSource,
  createPage,
  getPage,
} = helpers

// RESOURCE
const RESOURCE = 'A book made for testing'

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

    test('It should post/get new source with given ID', async done => {
      const sources = Object.keys(POST_EXAMPLE.sources)
      sources.forEach(async s => {
        const source = POST_EXAMPLE.sources[s].rawHtml
        const sourceId = POST_EXAMPLE.sources[s]._id
        const postResponse = await createSourceWithId(token, source, sourceId)
        const _sourceId = JSON.parse(postResponse.text)._id
        expect(_sourceId).toBe(sourceId)
        const getResponse = await getSourceNoAuthor(token, _sourceId)
        const res = JSON.parse(getResponse.text)
        expect(res.resource).toBe(source)
      })
      done()
    })

    test('It should post/get new entry with given ID', async done => {
      const entries = Object.keys(POST_EXAMPLE.entries)
      entries.forEach(async e => {
        const entry = POST_EXAMPLE.entries[e].rawHtml
        const entryId = POST_EXAMPLE.entries[e]._id
        const postResponse = await createEntryWithId(token, entry, entryId)
        const _entryId = JSON.parse(postResponse.text)._id
        expect(_entryId).toBe(entryId)
        const getResponse = await getEntryNoSource(token, _entryId)
        const res = JSON.parse(getResponse.text)
        expect(res.entry).toBe(entry)
      })
      done()
    })
    test('It should post/get new page with given ID', async done => {
      const page = POST_EXAMPLE.page
      const { _id, name, blocks } = page
      const postResponse = await createPage(token, _id, name, blocks)
      const _postId = JSON.parse(postResponse.text)._id
      expect(_postId).toBe(_id)
      const getResponse = await getPage(token, _id)
      const res = JSON.parse(getResponse.text)
      expect(res.name).toBe(name)
      done()
    })
    test('It should get and populate entries and sources', async done => {
      const blocks = POST_EXAMPLE.blocks
      getSourcesFromBlocks(blocks).then(s => {
        const sources = {}
        s.map(a => (sources[a._id] = a))
        expect(sources).toStrictEqual(POST_EXAMPLE.sources)
      })
      getEntriesFromBlocks(blocks).then(e => {
        const entries = {}
        e.map(a => (entries[a._id] = a))
        expect(entries).toStrictEqual(POST_EXAMPLE.entries)
      })
      done()
    })

    afterAll(async done => {
      await deleteUserPosts(token)
      return done()
    })
  })
})
