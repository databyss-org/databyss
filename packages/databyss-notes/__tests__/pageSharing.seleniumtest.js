/* eslint-disable func-names */
import assert from 'assert'
import innerText from 'innertext'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  sleep,
  sendKeys,
  enterKey,
  getEditor,
  getSharedPage,
  isAppInNotesSaved,
  paste,
  backspaceKey,
  tagButtonClick,
  tagButtonListClick,
  login,
  tryQuit,
} from './util.selenium'

import { selectLinkInFirstBlock } from './groupSharing.seleniumtest'

let driver
let editor
let actions

describe('page sharing', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: OSX, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    await sleep(500)
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
  })

  it('should ensure page sharing integrity', async () => {
    // If a page has been copied but is not public, only the private user can view it
    // populate a page
    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(500)
    await sendKeys(actions, 'this is the non shared page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await isAppInNotesSaved(driver)

    const privatePageURL = await driver.getCurrentUrl()

    await tagButtonClick('data-test-element="new-page-button"', driver)

    // If a page has been copied and is public, anyone can view it

    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(500)
    await sendKeys(actions, 'this is a shared page title')
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // make page public
    await tagButtonClick('data-test-element="archive-dropdown"', driver)

    await tagButtonClick('data-test-block-menu="togglePublic"', driver)

    // copy public link
    await tagButtonClick('data-test-block-menu="copy-link"', driver)

    editor = await getEditor(driver)
    await editor.click()

    await paste(actions)
    await selectLinkInFirstBlock(actions)

    // get the public page url
    const publicPageUrl = await driver.executeScript(
      'return window.getSelection().toString()'
    )

    // populate page
    await backspaceKey(actions)
    await sendKeys(actions, '@Public Page Source')
    await enterKey(actions)
    await sendKeys(actions, '#Public Page Topic')
    await enterKey(actions)
    await sendKeys(actions, 'this entry exists within the public page')
    await isAppInNotesSaved(driver)

    // allow the public page to replicate
    await sleep(10000)
    await isAppInNotesSaved(driver)

    // log user out to test links
    await tagButtonClick('data-test-element="account-menu"', driver)

    await sleep(1000)

    await tagButtonClick('data-test-block-menu="logout"', driver)

    // wait till login screen renders
    await getElementByTag(driver, '[data-test-path="email"]')

    // navigate to the private page url
    await driver.get(privatePageURL)

    /*
      unauthorized page on unauthorized user should return the login screen
    */
    await getElementByTag(driver, '[data-test-path="email"]')

    // const pageBody = body.trim() === 'Not Authorized' || body.trim() === ''
    // // confirm private page is not authorized
    // assert.equal(true, pageBody)

    // navigate to public page
    await driver.get(publicPageUrl)

    await getSharedPage(driver)

    // allow sync to occur
    await sleep(3000)
    // verify topic is in page
    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    await sleep(1000)
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await sleep(1000)

    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      0,
      driver
    )

    let header = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    header = await header.getAttribute('outerHTML')

    // verify that page is visible
    assert(header.match('this is a shared page title'))

    // check if source is linked to page
    await tagButtonClick('data-test-sidebar-element="sources"', driver)

    await sleep(1000)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await sleep(1000)
    await tagButtonListClick('data-test-element="source-results"', 0, driver)

    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    header = await getElementByTag(driver, '[data-test-element="page-header"]')

    header = await header.getAttribute('outerHTML')

    // verify that page is visible
    assert.equal(innerText(header), 'this is a shared page title')
  })
})
