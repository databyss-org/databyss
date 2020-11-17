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
  getElementsByTag,
  sendKeys,
  sleep,
  toggleBold,
  getElementById,
  enterKey,
  upKey,
  downKey,
  backspaceKey,
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

  it('should insert atomic source', async () => {
    await sleep(300)

    await sendKeys(actions, '@this is a test')

    // verify if there are no suggestions the suggestion menu appears
    await getElementByTag(driver, '[data-test-block-menu="OPEN_LIBRARY"]')
    await getElementByTag(driver, '[data-test-block-menu="CROSSREF"]')
    await getElementByTag(driver, '[data-test-block-menu="GOOGLE_BOOKS"]')
    await enterKey(actions)

    // populate with dummy text and other sources
    await sendKeys(actions, 'dummy text')
    await enterKey(actions)
    await enterKey(actions)

    // Suggestions don't break with strange characters (i.e. "[" "\" etc.)
    await sendKeys(actions, '@test [this] second \\ source')
    await enterKey(actions)

    await sendKeys(actions, 'this is more dummy text')
    await enterKey(actions)
    await enterKey(actions)

    await sendKeys(actions, '@this is a test')
    await enterKey(actions)

    await isSaved(driver)
    await sleep(1000)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>
            this is a test
            <cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>dummy text</text>
        </block>
        <block type="SOURCE">
          <text>test [this] second \ source</text>
        </block>
        <block type="ENTRY">
          <text>this is more dummy text</text>
        </block>
        <block type="SOURCE">
          <text>this is a test</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )

    // check if editor has correct value
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )
  })

  it('should provide previously entered sources as suggestions', async () => {
    await sleep(300)
    await sendKeys(actions, '@this is a test')
    // verify if there are no suggestions the suggestion menu appears
    await getElementByTag(driver, '[data-test-block-menu="OPEN_LIBRARY"]')
    await getElementByTag(driver, '[data-test-block-menu="CROSSREF"]')
    await getElementByTag(driver, '[data-test-block-menu="GOOGLE_BOOKS"]')
    await enterKey(actions)

    // populate with dummy text and other sources
    await sendKeys(actions, 'dummy text')
    await enterKey(actions)
    await enterKey(actions)

    // Suggestions don't break with strange characters (i.e. "[" "\" etc.)
    await sendKeys(actions, '@test [this] second \\ source')
    await enterKey(actions)

    await sendKeys(actions, 'this is more dummy text')
    await enterKey(actions)
    await enterKey(actions)

    await sendKeys(actions, '@test this')

    await isSaved(driver)
    await sleep(1000)

    // FIXME: duration to wait to ensure suggestions length is availble is not consistent
    await sleep(5000)

    // verify both the sources appear in suggestions
    const suggestions = await getElementsByTag(
      driver,
      '[data-test-element="suggested-menu-sources"]'
    )

    // ensure amount of sources added is reflected in menu
    assert.equal(suggestions.length, 2)
  })

  it('should test data integrity in round trip testing', async () => {
    await sleep(300)
    await sendKeys(actions, 'this is an entry with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold')
    await toggleBold(actions)
    await enterKey(actions)
    await sendKeys(actions, 'still within the same block')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this should toggle a source block')
    await enterKey(actions)
    await upKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await sendKeys(actions, '#this should toggle a topics block')
    await enterKey(actions)
    await sendKeys(actions, 'this entry is within two atomics')
    await enterKey(actions)
    await enterKey(actions)
    await backspaceKey(actions)
    await sendKeys(actions, ' appended text')
    await enterKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'second middle entry')
    await enterKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await upKey(actions)
    await backspaceKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)
    await sendKeys(actions, 'last entry')
    await isSaved(driver)

    // refresh page
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is an entry with </text>
          <text bold>bold</text>
          <text>{'\n'}still within the same block</text>
        </block>
        <block type="TOPIC">
          <text>this should toggle a topics block</text>
        </block>
        <block type="ENTRY">
          <text>this entry is within two atomics appended text</text>
        </block>
        <block type="ENTRY">
          <text>second middle entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this should toggle a source block</text>
        </block>
        <block type="ENTRY">
          <text>
            last entry
            <cursor />
          </text>
        </block>
      </editor>
    )
    // // check if editor has correct value
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
