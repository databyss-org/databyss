/* eslint-disable func-names */
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import {
  sleep,
  sendKeys,
  enterKey,
  isAppInNotesSaved,
  paste,
  selectAll,
  tagButtonClick,
  tagButtonListClick,
  upKey,
  getElementsByTag,
  getElementByTag,
  logout,
  downKey,
  downShiftKey,
  backspaceKey,
  login,
  tryQuit,
} from './util.selenium'
import { cleanUrl } from './util'

let driver
let actions

export async function selectLinkInFirstBlock(actions) {
  await upKey(actions)
  await upKey(actions)
  await upKey(actions)
  await downKey(actions)
  await downShiftKey(actions)
  await downShiftKey(actions)
  await downShiftKey(actions)
}

// TODO: THIS SHOULD BE ON THE PAGE SHARING  TEST
// 6) Archiving a page removes that page from shared pages
describe('group sharings', () => {
  let email
  beforeEach(async (done) => {
    driver = await startSession()
    email = await login(driver)
    actions = driver.actions()
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
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
    await selectLinkInFirstBlock(actions)

    const publicCollectionUrl = cleanUrl(
      await driver.executeScript('return window.getSelection().toString()')
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
    await selectLinkInFirstBlock(actions)
    await backspaceKey(actions)
    await paste(actions)
    await selectLinkInFirstBlock(actions)

    const publicCollectionDeleteUrl = cleanUrl(
      await driver.executeScript('return window.getSelection().toString()')
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
    await selectLinkInFirstBlock(actions)
    await backspaceKey(actions)
    await paste(actions)
    await selectLinkInFirstBlock(actions)

    const publicCollectionUnshareUrl = cleanUrl(
      await driver.executeScript('return window.getSelection().toString()')
    )
    // allow pages to sync
    await sleep(5000)

    // logout

    await logout(driver)

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
    await login(driver, email)

    // go to collections, remove first page from collection

    await tagButtonClick('title="Collections"', driver)

    // remove first page
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    await tagButtonClick('data-test-element="remove-page"', driver)

    // test to see if collection share a new added page
    await tagButtonClick('data-test-element="add-page-to-collection"', driver)
    // add second page to collection (will receive an updated atomic)
    await tagButtonListClick('data-test-block-menu="addPage"', 1, driver)
    await sleep(5000)

    // THIRD COLLECTION
    await tagButtonListClick('data-test-element="page-sidebar-item"', 2, driver)
    // UNSHARE GROUP
    await tagButtonClick('data-test-element="group-public"', driver)

    // SECOND COLLECTION
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)
    // Delete second collection
    await tagButtonClick('data-test-element="group-menu"', driver)
    await tagButtonClick('data-test-element="delete-group"', driver)
    await sleep(1000)

    // update topic on first page page (it should update on shared page with same topic)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    // update topic on first page page (it should update on shared page with same topic)    await upKey(actions)
    await tagButtonClick('data-test-atomic-edit="open"', driver)
    await sleep(1000)
    await tagButtonClick('data-test-path="text"', driver)
    await selectAll(actions)
    await sendKeys(actions, 'New Topic')

    // allow sync
    await sleep(5000)

    // click on page B
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)
    await sleep(3000)
    // navigate to third page and archive it
    await tagButtonListClick('data-test-element="page-sidebar-item"', 2, driver)

    await tagButtonClick('data-test-element="archive-dropdown"', driver)

    await tagButtonClick('data-test-block-menu="archive"', driver)
    await sleep(3000)

    // log out
    await logout(driver)

    // go to second and third collection (they should redirect to login screen)
    // go to public collection url
    await driver.get(publicCollectionDeleteUrl)
    await tagButtonClick('data-test-path="email"', driver)

    await driver.get(publicCollectionUnshareUrl)
    await tagButtonClick('data-test-path="email"', driver)

    // go to first page and verify atomic has been update
    await driver.get(publicCollectionUrl)

    // page should load, click on topics sidebar
    await tagButtonClick('data-test-sidebar-element="topics"', driver)
    // topic should appear on sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)
    const _topicResults = await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
    )

    // only  one page should appear
    assert.equal(_topicResults.length, 1)
    let _title = await getElementByTag(driver, '[data-test-path="text"]')
    _title = await _title.getAttribute('value')

    // should be updated topic
    assert.equal(_title, 'New Topic')

    // should  have a page attached to topic
    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    assert.equal(true, true)
  })
})
