/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  getElementById,
  enterKey,
  upKey,
  downKey,
  paste,
  copy,
  cut,
  selectAll,
  leftShiftKey,
  rightKey,
  sendKeys,
  leftKey,
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

describe('editor clipboard', () => {
  beforeEach(async done => {
    const random = Math.random()
      .toString(36)
      .substring(7)
    // OSX and safari are necessary
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

    await getElementByTag(driver, '[data-test-id="logoutButton"]')

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    editor.click()

    actions = driver.actions({ bridge: true })
    await actions.click(editor)

    //   actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.close()
    driver = null
  })

  afterAll(async () => {
    await driver.quit()
  })

  it('should have a multi-block selection with atomics and paste the whole atomic blocks', async () => {
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'in between text')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another source text')
    await upKey(actions)
    await selectAll(actions)
    await copy(actions)
    await downKey(actions)
    await downKey(actions)
    await paste(actions)
    await isSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>this is a source text</text>
        </block>
        <block type="ENTRY">
          <text>in between text</text>
        </block>
        <block type="SOURCE">
          <text>this is another source text</text>
        </block>
        <block type="SOURCE">
          <text>this is a source text</text>
        </block>
        <block type="ENTRY">
          <text>in between text</text>
        </block>
        <block type="SOURCE">
          <text>
            this is another source text<cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should prevent a paste from occuring in an atomic', async () => {
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'entry text')
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await copy(actions)
    await upKey(actions)
    await upKey(actions)
    await paste(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await paste(actions)
    await isSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>
            this<cursor /> is a source text
          </text>
        </block>
        <block type="ENTRY">
          <text>entry text</text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should remove an atomic fragment on a cut', async () => {
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await leftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await cut(actions)
    await actions.click(editor).perform()
    await actions.clear()
    await downKey(actions)
    await paste(actions)
    await isSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>
            this is a source text<cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should remove a multi-line atomic fragment on a cut', async () => {
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'has frag')
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await cut(actions)
    await downKey(actions)
    await downKey(actions)
    await paste(actions)
    await isSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="ENTRY">
          <text> frag</text>
        </block>
        <block type="SOURCE">
          <text>this is a source text</text>
        </block>
        <block type="ENTRY">
          <text>
            has<cursor />
          </text>
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
