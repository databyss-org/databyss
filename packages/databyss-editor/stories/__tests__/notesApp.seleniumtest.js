/* eslint-disable func-names */
import { Key, By } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  sleep,
  isAppInNotesSaved,
  sendKeys,
  enterKey,
  //  toggleBold,
  //   toggleItalic,
  //   toggleLocation,
  //   enterKey,
  //   upKey,
  //   downKey,
  backspaceKey,
} from './_helpers.selenium'

let driver
let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('notes app', () => {
  beforeEach(async done => {
    const random = Math.random()
      .toString(36)
      .substring(7)
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

    editor = await getEditor(driver)
    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should switch page names and verify atomics appear on the sidebar', async () => {
    // click on topics sidebar
    const topicSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )

    await topicSidebarButton.click()

    let headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await headerField.click()
    await sendKeys(actions, 'First Test Page Title')
    await enterKey(actions)

    await sendKeys(actions, '#this is a new topic')
    await enterKey(actions)
    await sendKeys(actions, 'entries included within the topic')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'more entries included within topic')
    await isAppInNotesSaved(driver)
    await sleep(1000)

    // verify that the topic sidebar has the new topic
    const sidebarTopic = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-1"]'
    )

    const sidebar = await sidebarTopic.getAttribute('innerText')

    assert.equal(sidebar.trim(), 'this is a new topic')

    // click on the topic in sidebar
    await sidebarTopic.click()
    await sleep(1000)

    // get all search page results
    const searchPageResultsTitle = await driver.findElements(
      By.tagName('[data-test-element="atomic-results"]')
    )

    await searchPageResultsTitle[0].click()
    await getEditor(driver)

    // add second page
    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()

    // wait for editor to be visible
    await getEditor(driver)

    const sourcesSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="sources"]'
    )

    await sourcesSidebarButton.click()

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await headerField.click()

    await sendKeys(actions, 'Second page title')
    await enterKey(actions)

    // select author from the google api
    await sendKeys(actions, '@Murray Bookchin')
    const googleApi = await getElementByTag(
      driver,
      '[data-test-block-menu="GOOGLE_BOOKS"]'
    )
    await googleApi.click()

    const firstResult = await getElementByTag(
      driver,
      '[data-test-catalog="GOOGLE_BOOKS"]'
    )

    await firstResult.click()

    await isAppInNotesSaved(driver)
    await sleep(1000)

    // check if source is on sidebar
    let sidebarSource = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-2"]'
    )

    sidebarSource = await sidebarSource.getAttribute('innerText')

    assert.equal(sidebarSource.trim(), 'Bookchin, M.')
    // delete the source and verify its removed from the sidebar
    await backspaceKey(actions)
    await backspaceKey(actions)

    // check if its in sidebar

    // TODO
    const firstPageButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )

    await firstPageButton.click()

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    // let editorField = await editor.getAttribute('innerText')

    assert.equal(headerField.trim(), 'First Test Page Title')

    // assert.equal(editorField.trim(), 'Editor test one')

    // Second page integrity test
    const secondPageButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-1"]'
    )

    await secondPageButton.click()

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    // editorField = await editor.getAttribute('innerText')

    assert.equal(headerField.trim(), 'Second page title')
    // assert.equal(editorField.trim(), 'Editor test two')
  })

  it('disable in offline mode', async () => {
    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()

    const editor = await getEditor(driver)
    editor.sendKeys('Offline test')
    await sleep(3000)

    // toggle offline
    if (!process.env.LOCAL_ENV) {
      await driver.executeScript('sauce:throttleNetwork', {
        condition: 'offline',
      })
    }

    let isEnabled

    try {
      await newPageButton.click()
      isEnabled = true
    } catch {
      isEnabled = false
    }

    assert.equal(isEnabled, false)

    //   toggle online
    if (!process.env.LOCAL_ENV) {
      await driver.executeScript('sauce:throttleNetwork', {
        condition: 'online',
      })
    }

    await sleep(500)

    try {
      await newPageButton.click()
      isEnabled = true
    } catch {
      isEnabled = false
    }

    assert.equal(isEnabled, true)
  })
})
