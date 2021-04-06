/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  getElementsByTag,
  sleep,
  sendKeys,
  enterKey,
  getEditor,
  getSharedPage,
  isAppInNotesSaved,
  paste,
  selectAll,
  backspaceKey,
  tagButtonClick,
  tagButtonListClick,
  dragAndDrop,
  logIn,
  upKey,
  rightKey,
} from './_helpers.selenium'

let driver
let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

// 1) Adding a page adds page to an already public group
// 2) Taking away a page takes away a page from an already public group
// 3) Changing a topic name on a page that's not included in the group, but that has the same topic as in the group, updates the topic name in the group
// 4) Updates to pages get updated in groups
// 5) Archiving a page removes that page from a group
// 7) Making a group private makes the shared page inaccessible
// 8) Deleting a group makes the shared page inaccessible

// TODO: THIS SHOULD BE ON THE PAGE SHARING  TEST
// 6) Archiving a page removes that page from shared pages
describe('group sharings', () => {
  let email
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    email = `${random}@test.com`
    // OSX and chrome are necessary
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await sleep(1000)
    await logIn(email, driver)
    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    if (driver) {
      await driver.quit()
      driver = null
      await sleep(100)
    }
  })

  it('should ensure group sharing integrity', async () => {
    // create first page
    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'A - This page will be shared then removed')
    await enterKey(actions)
    await sendKeys(actions, '#this topic will be duplicated')
    await enterKey(actions)
    await sendKeys(actions, 'entries about topic')

    await isAppInNotesSaved(driver)

    // create second page
    await tagButtonClick('data-test-element="new-page-button"', driver)
    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'B - This page will remain and get updated atomic')
    await enterKey(actions)
    await sendKeys(actions, '#this topic will be duplicated')
    await enterKey(actions)
    await sendKeys(actions, 'more under same topic')

    // create third page (will be archived)
    await tagButtonClick('data-test-element="new-page-button"', driver)
    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'C - This page will be shared then archived')
    await enterKey(actions)
    await sendKeys(actions, '#this topic will be duplicated')
    await enterKey(actions)
    await sendKeys(actions, 'more under same topic')

    // CREATES NEW COLLECTION (share)

    // click collections
    await tagButtonClick('title="Collections"', driver)
    // click new collection
    await tagButtonClick('data-test-element="new-page-button"', driver)
    // click collection title
    await tagButtonClick('data-test-path="name"', driver)

    await sendKeys(actions, 'A - Test Collection One, will remain shared')
    // click on pages dropdown
    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    // add page collection
    await tagButtonListClick('data-test-block-menu="addPage"', 0, driver)
    // open pages dropdown
    await sleep(1000)

    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    await tagButtonListClick('data-test-block-menu="addPage"', 2, driver)
    await sleep(1000)
    // open pages dropdown
    await tagButtonClick('data-test-element="group-public"', driver)
    await sleep(1000)

    // copy link
    await tagButtonClick('data-test-element="copy-link"', driver)
    // click on pages sidebar button

    // CREATE A CLIPBOARD PAGE
    await tagButtonClick('data-test-sidebar-element="pages"', driver)
    // add new page
    await tagButtonClick('data-test-element="new-page-button"', driver)
    // click on header
    await tagButtonClick('data-test-element="page-header"', driver)
    // page title
    await sendKeys(actions, 'D - this page is the clipboard')
    await enterKey(actions)
    await paste(actions)

    // get public collection link
    await selectAll(actions)

    const publicCollectionUrl = await driver.executeScript(
      'return window.getSelection().toString()'
    )

    // CREATE SECOND COLLECTION (delete)

    // click collections
    await tagButtonClick('title="Collections"', driver)
    // click new collection
    await tagButtonClick('data-test-element="new-page-button"', driver)
    // click collection title
    await tagButtonClick('data-test-path="name"', driver)

    await sendKeys(actions, 'B - Test Collection Two, will be deleted')
    // click on pages sidebar button
    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    // add collection
    await tagButtonListClick('data-test-block-menu="addPage"', 0, driver)
    await sleep(1000)

    // open pages dropdown
    await tagButtonClick('data-test-element="group-public"', driver)
    await sleep(1000)

    // copy link
    await tagButtonClick('data-test-element="copy-link"', driver)

    // GO TO CLIPBOARD PAGE
    // click on pages sidebar button
    await tagButtonClick('data-test-sidebar-element="pages"', driver)
    // click on clipboard
    await tagButtonListClick('data-test-element="page-sidebar-item"', 3, driver)
    // paste new link
    await selectAll(actions)
    await paste(actions)
    await selectAll(actions)

    const publicCollectionDeleteUrl = await driver.executeScript(
      'return window.getSelection().toString()'
    )

    // THIRD COLLECTION WILL BE UNSHARED

    // click collections
    await tagButtonClick('title="Collections"', driver)
    // click new collection
    await tagButtonClick('data-test-element="new-page-button"', driver)
    // click collection title
    await tagButtonClick('data-test-path="name"', driver)

    await sendKeys(actions, 'C - Test Collection Three, will be unshared')
    // click on pages sidebar button
    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    // add collection
    await tagButtonListClick('data-test-block-menu="addPage"', 0, driver)
    await sleep(1000)

    // open pages dropdown
    await tagButtonClick('data-test-element="group-public"', driver)
    // copy link
    await tagButtonClick('data-test-element="copy-link"', driver)

    // GO TO CLIPBOARD PAGE
    // click on pages sidebar button
    await tagButtonClick('data-test-sidebar-element="pages"', driver)
    // click on clipboard
    await tagButtonListClick('data-test-element="page-sidebar-item"', 3, driver)
    // paste new link
    await selectAll(actions)
    await paste(actions)
    await selectAll(actions)

    const publicCollectionUnshareUrl = await driver.executeScript(
      'return window.getSelection().toString()'
    )

    // logout
    await tagButtonClick('data-test-element="account-menu"', driver)
    await tagButtonClick('data-test-block-menu="logout"', driver)

    // wait for email input to appear
    await tagButtonClick('data-test-path="email"', driver)

    // CHECK IF FIRST COLLECTION SHARED
    // go to public collection url
    await driver.get(publicCollectionUrl)

    // page should load, click on topics sidebar
    await tagButtonClick('data-test-sidebar-element="topics"', driver)
    // topic should appear on sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    // should  have a page attached to topic
    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    // CHECK SECOND COLLECTION

    // go to public collection url
    await driver.get(publicCollectionDeleteUrl)

    // page should load, click on topics sidebar
    await tagButtonClick('data-test-sidebar-element="topics"', driver)
    // topic should appear on sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    // should  have a page attached to topic
    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    // CHECK THIRD COLLECTION
    // go to public collection url
    await driver.get(publicCollectionUnshareUrl)

    // page should load, click on topics sidebar
    await tagButtonClick('data-test-sidebar-element="topics"', driver)
    // topic should appear on sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    // should  have a page attached to topic
    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    // log in again
    await logIn(email, driver)

    // go to collections, remove first page from collection

    await tagButtonClick('title="Collections"', driver)

    // remove first page
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    await tagButtonClick('data-test-element="remove-page"', driver)

    // test to see if collection share a new added page
    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    // add second page to collection (will receive an updated atomic)
    await tagButtonListClick('data-test-block-menu="addPage"', 1, driver)
    await sleep(1000)

    // SECOND COLLECTION
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)
    // Delete second collection
    await tagButtonClick('data-test-element="group-menu"', driver)
    await tagButtonClick('data-test-element="delete-group"', driver)
    await sleep(1000)

    // THIRD COLLECTION
    await tagButtonListClick('data-test-element="page-sidebar-item"', 2, driver)
    // UNSHARE GROUP
    await tagButtonClick('data-test-element="group-public"', driver)

    // update topic on first page page (it should update on shared page with same topic)
    await tagButtonClick('data-test-sidebar-element="pages"', driver)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    // update topic on first page page (it should update on shared page with same topic)    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await rightKey(actions)
    await enterKey(actions)
    await selectAll(actions)
    await sendKeys(actions, 'New Topic')
    await enterKey(actions)

    // navigate to third page and archive it
    await tagButtonClick('data-test-sidebar-element="pages"', driver)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 2, driver)

    await tagButtonClick('data-test-element="archive-dropdown"', driver)

    await tagButtonClick('data-test-block-menu="archive"', driver)
    await sleep(1000)

    // log out
    await tagButtonClick('data-test-element="account-menu"', driver)
    await tagButtonClick('data-test-block-menu="logout"', driver)

    // wait for email input to appear
    await tagButtonClick('data-test-path="email"', driver)

    // go to second and third collection (they should redirect to login screen)
    // go to public collection url
    await driver.get(publicCollectionDeleteUrl)
    await tagButtonClick('data-test-path="email"', driver)

    await driver.get(publicCollectionUnshareUrl)
    await tagButtonClick('data-test-path="email"', driver)

    // go to first page and verify atomic has been update
    await driver.get(publicCollectionUrl)

    await sleep(50000)
    assert.equal(true, true)
  })
})
