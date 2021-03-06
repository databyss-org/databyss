/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sendKeys,
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
  getElementById,
  isSaved,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=services-auth--login'

const LOCAL_URL_EDITOR =
  'http://localhost:6006/iframe.html?id=services-page--slate-5'
const PROXY_URL_EDITOR =
  'http://0.0.0.0:8080/iframe.html?id=services-page--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('connected editor', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    // OSX and safari are necessary
    driver = await startSession()
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

    await getElementByTag(driver, '[data-test-id="logoutButton"]')

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    actions = driver.actions()
    await actions.click(editor)
    await actions.perform()
    await actions.clear()

    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.quit()
    driver = null
    await sleep(100)
  })

  it('should test editor and database sync and functionality', async () => {
    await sleep(300)
    await sendKeys(actions, 'the following text should be ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold')
    await toggleBold(actions)
    await sendKeys(actions, ' the following text should be ')
    await toggleItalic(actions)
    await sendKeys(actions, 'italic')
    await toggleItalic(actions)
    await sendKeys(actions, ' and the final text should be a ')
    await toggleLocation(actions)
    await sendKeys(actions, 'location')
    await isSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>the following text should be </text>
          <text bold>bold</text>
          <text> the following text should be </text>
          <text italic>italic</text>
          <text> and the final text should be a </text>
          <text location>location</text>
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

  it('should toggle location bold and italic in entry using hotkeys', async () => {
    await sleep(300)
    await sendKeys(actions, 'following text should be ')
    await toggleBold(actions)
    await toggleItalic(actions)
    await await sendKeys(actions, 'bold and italic ')
    await toggleItalic(actions)
    await await sendKeys(actions, 'and just bold ')
    await toggleLocation(actions)
    await await sendKeys(actions, 'and location with bold')
    await isSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
          <text bold italic>
            bold and italic{' '}
          </text>
          <text bold>and just bold </text>
          <text bold location>
            and location with bold
          </text>
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
