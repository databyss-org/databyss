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
  isAppInNotesSaved,
  paste,
  selectAll,
  backspaceKey,
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

  it('should ensure page sharing integrity', async () => {
    // If a page has been copied but is not public, only the private user can view it
    // populate a page
    let pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is the non shared page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await isAppInNotesSaved(driver)

    const privatePageURL = await driver.getCurrentUrl()

    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()
    // If a page has been copied and is public, anyone can view it
    pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is a shared page title')
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // make page public
    const pageDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )

    await pageDropdown.click()

    const publicPageToggle = await getElementByTag(
      driver,
      '[data-test-block-menu="togglePublic"]'
    )

    await publicPageToggle.click()

    // copy public link
    const publicPageLink = await getElementByTag(
      driver,
      '[data-test-block-menu="copy-link"]'
    )

    await publicPageLink.click()

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

    // log user out to test links
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

    // wait till login screen renders
    await getElementByTag(driver, '[data-test-path="email"]')

    // navigate to the private page url
    await driver.get(privatePageURL)

    let body = await getElementByTag(driver, '[data-test-element="body"]')

    body = await body.getAttribute('innerText')

    /*
      unauthorized page should return empty page or not authorized
    */
    const pageBody = body.trim() === 'Not Authorized' || body.trim() === ''
    // confirm private page is not authorized
    assert.equal(true, pageBody)

    // navigate to public pageq
    await driver.get(publicPageUrl)
    // verify topic is in page
    const topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()

    await sleep(1000)

    const topic = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await topic[0].click()

    await sleep(1000)

    const topicEntries = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
    )

    await topicEntries[0].click()

    let header = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    header = await header.getAttribute('value')

    // verify that page is visible
    assert.equal(header.trim(), 'this is a shared page title')

    // check if source is linked to page
    const sourcesSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="sources"]'
    )
    await sourcesSidebarButton.click()

    await sleep(1000)

    const allSources = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await allSources[0].click()

    await sleep(1000)

    const sourcesResults = await getElementsByTag(
      driver,
      '[data-test-element="source-results"]'
    )

    await sourcesResults[0].click()

    const sourceResults = await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
    )

    await sourceResults[0].click()

    header = await getElementByTag(driver, '[data-test-element="page-header"]')

    header = await header.getAttribute('value')

    // verify that page is visible
    assert.equal(header.trim(), 'this is a shared page title')
  })
})
