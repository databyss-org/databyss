/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sleep,
  toggleBold,
  getElementById,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let emailButton
// let emailTextField
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=services-auth--login'

const LOCAL_URL_EDITOR =
  'http://localhost:6006/iframe.html?id=services-page--slate-5'
const PROXY_URL_EDITOR =
  'http://0.0.0.0:8080/iframe.html?id=services-page--slate-5'

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('connected editor', () => {
  beforeAll(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-database-connector', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    // LOGIN FLOW
    emailButton = await getElementByTag(driver, '[data-test-id="emailButton"]')
    await emailButton.click()

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

    await getElementByTag(driver, '[data-test-id="logoutButton"]')

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should toggle bold and save changes', async () => {
    await sleep(300)
    await actions.sendKeys('the following text should be ')
    await toggleBold(actions)
    await actions.sendKeys('bold')
    await actions.perform()
    await sleep(7000)

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )
    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>the following text should be </text>
          <text bold>bold</text>
          <cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
