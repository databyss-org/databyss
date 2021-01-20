/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  getElementsByTag,
  sleep,
  isAppInNotesSaved,
  sendKeys,
  enterKey,
  backspaceKey,
} from './_helpers.selenium'

let driver
let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://localhost:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('notes app', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
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
    await getElementByTag(driver, '[data-test-path="email"]')
    await driver.quit()
    driver = null
    await sleep(100)
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

    // verify that the topic sidebar has the new topic
    const sidebarTopic = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    const sidebar = await sidebarTopic[0].getAttribute('innerText')

    assert.equal(sidebar.trim(), 'this is a new topic')

    // click on the topic in sidebar
    await sidebarTopic[0].click()
    await sleep(1000)

    // get all search page results
    const searchPageResultsTitle = await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
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

    const firstResult = await getElementsByTag(
      driver,
      '[data-test-catalog="GOOGLE_BOOKS"]'
    )

    await firstResult[0].click()

    await isAppInNotesSaved(driver)

    // check if source is on sidebar
    let sidebarSource = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    sidebarSource = await sidebarSource[2].getAttribute('innerText')

    // verify source added to sidebar
    assert.equal(sidebarSource.trim().length > 0, true)
    // delete the source and verify its removed from the sidebar
    await backspaceKey(actions)
    await backspaceKey(actions)

    // check if the source exists in the sidebar, it should be removed

    sidebarSource = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    assert.equal(sidebarSource.length, 2)

    await sendKeys(actions, 'Editor test two')

    // click on sidebar for pages menu

    const pagesSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="pages"]'
    )

    await pagesSidebarButton.click()
    await sleep(500)

    const firstPageButton = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await firstPageButton[0].click()

    await getEditor(driver)

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('value')

    assert.equal(headerField.trim(), 'First Test Page Title')

    // Second page integrity test
    const secondPageButton = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await secondPageButton[1].click()

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    const editorField = await editor.getAttribute('innerText')

    assert.equal(headerField.trim(), 'Second page title')
    assert.equal(editorField.trim(), 'Editor test two')
  })

  // it('disable in offline mode', async () => {
  //   const newPageButton = await getElementByTag(
  //     driver,
  //     '[data-test-element="new-page-button"]'
  //   )

  //   await newPageButton.click()

  //   const editor = await getEditor(driver)
  //   editor.sendKeys('Offline test')
  //   await sleep(3000)

  //   // toggle offline
  //   if (!process.env.LOCAL_ENV) {
  //     await driver.executeScript('sauce:throttleNetwork', {
  //       condition: 'offline',
  //     })
  //   }

  //   let isEnabled

  //   try {
  //     await newPageButton.click()
  //     isEnabled = true
  //   } catch {
  //     isEnabled = false
  //   }

  //   assert.equal(isEnabled, false)

  //   //   toggle online
  //   if (!process.env.LOCAL_ENV) {
  //     await driver.executeScript('sauce:throttleNetwork', {
  //       condition: 'online',
  //     })
  //   }

  //   await sleep(500)

  //   try {
  //     await newPageButton.click()
  //     isEnabled = true
  //   } catch {
  //     isEnabled = false
  //   }

  //   assert.equal(isEnabled, true)
  // })
})
