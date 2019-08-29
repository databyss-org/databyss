const helpers = require('./_helpers')
const constants = require('./_constants')

const { POST_EDIT_ONE, POST_EDIT_TWO } = constants

const {
  noAuthPost,
  createUser,
  deleteUserPosts,
  getPopulatedPage,
  getPage,
  getUserInfo,
  createPage,
  addUserToAccount,
} = helpers

// RESOURCE
const RESOURCE = 'A book made for testing'

// USER
const EMAIL = 'email5@company.com'
const PASSWORD = 'password'

// USER 2
const EMAIL2 = 'email6@company.com'
const PASSWORD2 = 'password'

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
    let _token
    beforeAll(async done => {
      token = await createUser(EMAIL, PASSWORD)
      done()
    }, 5000)

    describe('create an account and add user to account', () => {
      test('it should add a page state', async done => {
        // create a page
        const pageResponse = await createPage(token, POST_EDIT_ONE)
        expect(pageResponse.statusCode).toBe(200)

        let page = JSON.parse(pageResponse.text)
        const accountId = page.account

        // create second user
        _token = await createUser(EMAIL2, PASSWORD2)
        const userTwoInfo = await getUserInfo(_token)
        const userTwoId = JSON.parse(userTwoInfo.text)
        // add second user to account
        const addUserResponse = await addUserToAccount(
          token,
          accountId,
          userTwoId
        )
        const addUser = JSON.parse(addUserResponse.text)
        expect(addUser.users[1]).toBe(userTwoId)

        // checks if second user can access page
        page = POST_EDIT_ONE.page
        const { _id, name } = page
        const getPageResponse = await getPage(_token, _id)
        const pageResponseTest = JSON.parse(getPageResponse.text)
        expect(pageResponseTest._id).toBe(_id)
        expect(pageResponseTest.name).toBe(name)

        // allow second user to edit the page
        const pageTwoResponse = await createPage(_token, POST_EDIT_TWO)
        expect(pageTwoResponse.statusCode).toBe(200)

        // SHOULD RETURN SECOND POPULATED STATE
        const pageId = POST_EDIT_ONE.page._id
        const getResponse = await getPopulatedPage(_token, pageId)
        const res = JSON.parse(getResponse.text)
        expect(res.sources).toStrictEqual(POST_EDIT_TWO.sources)
        expect(res.entries).toStrictEqual(POST_EDIT_TWO.entries)
        done()
      })
    })

    afterAll(async done => {
      await deleteUserPosts(token)
      return done()
    })
  })
})
