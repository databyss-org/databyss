/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  sleep,
  isAppInNotesSaved,
  //  toggleBold,
  //   toggleItalic,
  //   toggleLocation,
  //   enterKey,
  //   upKey,
  //   downKey,
  //   backspaceKey,
} from './_helpers.selenium'

let driver
let editor
// let actions
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

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should switch page names', async () => {
    let headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await headerField.sendKeys('First Test Page Title')

    editor.sendKeys('Editor test one')
    await isAppInNotesSaved(driver)

    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    await headerField.sendKeys('Second page title')

    editor = await getEditor(driver)

    editor.sendKeys('Editor test two')

    await isAppInNotesSaved(driver)

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

    let editorField = await editor.getAttribute('innerText')

    assert.equal(headerField, 'First Test Page Title')
    assert.equal(editorField, 'Editor test one')

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

    editorField = await editor.getAttribute('innerText')

    assert.equal(headerField, 'Second page title')
    assert.equal(editorField, 'Editor test two')
  })

  it('disable in offline mode', async () => {
    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()

    const editor = await getEditor(driver)
    editor.sendKeys('Offline test')
    await isAppInNotesSaved(driver)

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
