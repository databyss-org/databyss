/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  sleep,
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

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('notes app', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Notes app', OSX, CHROME)
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

    await sleep(1000)

    editor = await getEditor(driver)

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('shoud switch page names', async () => {
    let headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await headerField.sendKeys('First Test Page Title')

    editor.sendKeys('Editor test one')

    await sleep(2000)

    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()
    await sleep(2000)

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    await headerField.sendKeys('Second page title')

    editor = await getEditor(driver)

    editor.sendKeys('Editor test two')

    await sleep(2000)

    const firstPageButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )

    await firstPageButton.click()

    await sleep(1000)

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

    await sleep(1000)

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    editorField = await editor.getAttribute('innerText')

    await sleep(1000)

    assert.equal(headerField, 'Second page title')
    assert.equal(editorField, 'Editor test two')

    assert.equal(true, true)
  })
})
