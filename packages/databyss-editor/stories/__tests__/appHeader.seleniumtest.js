/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  isAppInNotesSaved,
  sleep,
  sendKeys,
  enterKey,
  upKey,
  downKey,
} from './_helpers.selenium'

let driver
// let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

const random = Math.random().toString(36).substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('app sticky header', () => {
  beforeEach(async (done) => {
    // OSX and chrome are necessary
    driver = await startSession({ platformName: OSX, browserName: CHROME })
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    const emailField = await getElementByTag(driver, '[data-test-path="email"]')
    await emailField.sendKeys(`${random}@test.com`)

    let continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )
    await continueButton.click()

    const codeField = await getElementByTag(driver, '[data-test-path="code"]')
    await codeField.sendKeys('test-code-42')

    continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )

    await continueButton.click()

    // wait for editor to be visible
    await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    const accountDropdown = await getElementByTag(
      driver,
      '[data-test-element="account-menu"]'
    )

    await accountDropdown.click()
    const logoutButton = await getElementByTag(
      driver,
      '[data-test-block-menu="logout"]'
    )

    await logoutButton.click()
    await sleep(100)
    await driver.quit()
    driver = null
    await sleep(100)
  })

  it('should render correct editor path for cursor', async () => {
    const pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is a page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a test source')
    await enterKey(actions)
    await sendKeys(actions, 'this is another test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sendKeys(actions, 'last entry')
    await isAppInNotesSaved(driver)

    // get page path
    let headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )

    headerSticky = await headerSticky.getAttribute('innerText')

    assert.equal(headerSticky, 'this is a page title / @ this is a test source')

    await upKey(actions)
    await upKey(actions)
    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(
      headerSticky,
      'this is a page title / @ this is a test source / # this is a topic'
    )

    await upKey(actions)
    await upKey(actions)
    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title / @ this is a test source')

    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/@')
    await downKey(actions)
    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title / # this is a topic')

    await downKey(actions)

    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    isAppInNotesSaved(driver)

    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title')
  })
})
