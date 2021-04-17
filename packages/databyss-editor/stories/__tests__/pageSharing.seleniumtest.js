/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
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
} from './_helpers.selenium'

let driver
let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('page sharing', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    // OSX and chrome are necessary
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await sleep(1000)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    const emailField = await getElementByTag(driver, '[data-test-path="email"]')
    await emailField.sendKeys(`${random}@test.com`)

    await tagButtonClick('data-test-id="continueButton"', driver)

    const codeField = await getElementByTag(driver, '[data-test-path="code"]')
    await codeField.sendKeys('test-code-42')

    await tagButtonClick('data-test-id="continueButton"', driver)

    // wait for editor to be visible
    await getEditor(driver)
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
    await selectAll(actions)

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

    header = await header.getAttribute('value')

    // verify that page is visible
    assert.equal(header.trim(), 'this is a shared page title')

    // check if source is linked to page
    await tagButtonClick('data-test-sidebar-element="sources"', driver)

    await sleep(1000)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await sleep(1000)
    await tagButtonListClick('data-test-element="source-results"', 0, driver)

    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    header = await getElementByTag(driver, '[data-test-element="page-header"]')

    header = await header.getAttribute('value')

    // verify that page is visible
    assert.equal(header.trim(), 'this is a shared page title')
  })
})
