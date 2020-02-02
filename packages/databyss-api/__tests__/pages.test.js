import {
  createUser,
  deleteUserPosts,
  newAccountWithUserId,
  getPopulatedPage,
  getPage,
  getUserInfo,
  createPage,
  addUserToAccount,
  deleteUserFromAccount,
} from './_helpers'
import { POST_EDIT_ONE, POST_EDIT_TWO } from './_constants'

// PERMISSIONS
const ADMIN = 'ADMIN'
const EDITOR = 'EDITOR'
// const READ_ONLY = 'READ_ONLY'

// USER
const EMAIL = 'email5@company.com'

// USER 2
const EMAIL2 = 'email6@company.com'

jest.setTimeout(30000)

// CREATE ACCOUNT
describe('Pages', () => {
  describe('Authorized', () => {
    let token
    let account
    let _token
    beforeAll(async done => {
      token = await createUser(EMAIL)
      console.log('TOKEN', token)
      done()
    })

    describe('create an account and add user to account', () => {
      test('it should add a page state', async done => {
        // create an account
        const accountResponse = await newAccountWithUserId(token)
        account = JSON.parse(accountResponse.text)

        // create page
        const pageResponse = await createPage(token, account._id, POST_EDIT_ONE)
        expect(pageResponse.statusCode).toBe(200)
        let page = JSON.parse(pageResponse.text)
        expect(page.account).toBe(account._id)

        // create second user
        _token = await createUser(EMAIL2)

        const userTwoInfo = await getUserInfo(_token)
        const userTwoId = JSON.parse(userTwoInfo.text)

        // add second user to account
        let role = ADMIN
        let addUserResponse = await addUserToAccount(
          token,
          account._id,
          userTwoId,
          role
        )
        let addUser = JSON.parse(addUserResponse.text)
        expect(addUser.users[1]._id).toBe(userTwoId)
        expect(addUser.users[1].role).toBe(ADMIN)

        // change second user role
        role = EDITOR
        addUserResponse = await addUserToAccount(
          token,
          account._id,
          userTwoId,
          role
        )
        addUser = JSON.parse(addUserResponse.text)
        expect(addUser.users[1]._id).toBe(userTwoId)
        expect(addUser.users[1].role).toBe(EDITOR)

        // checks if second user can access page
        page = POST_EDIT_ONE.page
        const { _id, name } = page
        const getPageResponse = await getPage(_token, account._id, _id)

        const pageResponseTest = JSON.parse(getPageResponse.text)
        expect(pageResponseTest._id).toBe(_id)
        expect(pageResponseTest.name).toBe(name)

        // allow second user to edit the page
        const pageTwoResponse = await createPage(
          _token,
          account._id,
          POST_EDIT_TWO
        )
        expect(pageTwoResponse.statusCode).toBe(200)

        // SHOULD RETURN SECOND POPULATED STATE
        const pageId = POST_EDIT_ONE.page._id
        const getResponse = await getPopulatedPage(_token, account._id, pageId)
        const res = JSON.parse(getResponse.text)
        expect(res.sources).toStrictEqual(POST_EDIT_TWO.sources)
        expect(res.entries).toStrictEqual(POST_EDIT_TWO.entries)

        // SHOULD DELETE SECOND USER
        let deleteResponse = await deleteUserFromAccount(
          token,
          account._id,
          userTwoId
        )
        expect(deleteResponse.statusCode).toBe(200)
        deleteResponse = JSON.parse(deleteResponse.text)

        done()
      })
    })

    afterAll(async done => {
      await deleteUserPosts(token)
      return done()
    })
  })
})
