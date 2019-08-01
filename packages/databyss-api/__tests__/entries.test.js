const helpers = require('./_helpers')

const {
  createUser,
  noAuthEntry,
  createEntryNoSource,
  getEntryNoSource,
  createEntryNewSource,
  getEntryNewSource,
} = helpers

const ENTRY = 'Testing an entry'
const ENTRY_WITH_SOURCE = 'this is a source entry'
const SOURCE = 'this is the source'

describe('Entry', () => {
  describe('Not authorized', () => {
    test('Create should require Authorization', async done => {
      noAuthEntry(ENTRY).then(response => {
        expect(response.statusCode).toBe(401)
        done()
      })
    })
  })
})

describe('Authorized', () => {
  let token
  beforeAll(async done => {
    token = await createUser()
    done()
  }, 5000)

  test('It should post/get new entry with no source or author', async () => {
    let newEntryId
    await createEntryNoSource(token, ENTRY).then(response => {
      newEntryId = JSON.parse(response.text)._id
      expect(response.statusCode).toBe(200)
    })
    getEntryNoSource(token, newEntryId).then(response => {
      const res = JSON.parse(response.text)
      expect(res.entry).toBe(ENTRY)
    })
  })

  test('It should post new entry with new source', async () => {
    let newEntryId
    let sourceId
    await createEntryNewSource(token, ENTRY_WITH_SOURCE, SOURCE).then(
      response => {
        newEntryId = JSON.parse(response.text)._id
        expect(response.statusCode).toBe(200)
        const res = JSON.parse(response.text)
        sourceId = res.source
        expect(response.statusCode).toBe(200)
      }
    )
    await getEntryNewSource(token, newEntryId).then(response => {
      const res = JSON.parse(response.text)
      expect(res.entry).toBe(ENTRY_WITH_SOURCE)
      expect(res.source).toBe(sourceId)
    })
  })
})
