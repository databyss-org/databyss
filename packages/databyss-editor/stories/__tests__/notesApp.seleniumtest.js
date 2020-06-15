/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
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

const LOCAL_URL_EDITOR = 'http://localhost:3000'
const PROXY_URL_EDITOR = 'http://0.0.0.0:3000'

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('notes app', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Notes app', OSX, SAFARI)
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

    actions = driver.actions()

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
    // store first page id
    let url = await driver.getCurrentUrl()
    url = url.split('/')

    const firstPageId = url[url.length - 1]

    await newPageButton.click()
    await sleep(2000)

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    await headerField.sendKeys('Second page title')

    editor = await getEditor(driver)

    editor.sendKeys('Editor test two')

    url = await driver.getCurrentUrl()
    url = url.split('/')

    const secondPageId = url[url.length - 1]

    await sleep(2000)

    await driver.get(
      process.env.LOCAL_ENV
        ? `${LOCAL_URL_EDITOR}/pages/${firstPageId}`
        : PROXY_URL_EDITOR
    )

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    const firstHeaderField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    const firstEditorField = await editor.getAttribute('innerText')

    await driver.get(
      process.env.LOCAL_ENV
        ? `${LOCAL_URL_EDITOR}/pages/${secondPageId}`
        : PROXY_URL_EDITOR
    )

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    const secondHeaderField = await headerField.getAttribute('value')

    editor = await getEditor(driver)

    const secondEditorField = await editor.getAttribute('innerText')

    await sleep(3000)

    assert.equal(firstHeaderField, 'First Test Page Title')
    assert.equal(firstEditorField, 'Editor test one\n')

    assert.equal(secondHeaderField, 'Second page title')
    assert.equal(secondEditorField, 'Editor test two\n')
  })
})
