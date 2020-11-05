/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sleep,
  getElementById,
  enterKey,
  sendKeys,
  undo,
  redo,
  cut,
  leftKey,
  paste,
  upKey,
  rightKey,
  downShiftKey,
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

describe('editor history', () => {
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

    actions = driver.actions()

    actions = driver.actions({ bridge: true })
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

  it('should undo a multiblock entry with an atomic', async () => {
    await sleep(300)
    await sendKeys(actions, 'this entry should stay')
    await enterKey(actions)
    await enterKey(actions)
    await sleep(500)
    await driver.navigate().refresh()
    await sleep(3000)
    await sendKeys(actions, 'this should eventually be undone')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this will be an undone source')
    await enterKey(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)

    await sleep(3000)
    await driver.navigate().refresh()
    await sleep(3000)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this entry should stay</text>
          <cursor />
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
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

  it('should redo a multiblock entry with an atomic', async () => {
    await sleep(500)
    await sendKeys(actions, 'this entry should stay')
    await enterKey(actions)
    await enterKey(actions)
    await isSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)
    await sendKeys(actions, 'this should eventually be undone')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this will be an undone source')
    await enterKey(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await undo(actions)
    await isSaved(driver)

    // checks before redo
    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text>this entry should stay</text>
          <cursor />
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await redo(actions)
    await isSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text>this entry should stay</text>
          <cursor />
        </block>
        <block type="ENTRY">
          <text>this should eventually be undone</text>
        </block>
        <block type="SOURCE">
          <text>this will be an undone source</text>
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
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

  it('should redo a multiblock cut with an atomic', async () => {
    await sleep(300)
    await sendKeys(actions, 'one')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'two')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'three')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@test source')
    await enterKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await downShiftKey(actions)
    await downShiftKey(actions)
    await downShiftKey(actions)
    await cut(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await paste(actions)
    await sleep(2000)
    await paste(actions)
    await sleep(2000)
    await paste(actions)
    await sleep(2000)
    await undo(actions)
    await sleep(2000)
    await undo(actions)
    await sleep(2000)
    await undo(actions)
    await isSaved(driver)

    // checks before redo
    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text>
            one<cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>tw</text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await redo(actions)
    await redo(actions)

    await sleep(3000)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text>one</text>
        </block>
        <block type="ENTRY">
          <text>o</text>
        </block>
        <block type="ENTRY">
          <text>three</text>
        </block>
        <block type="SOURCE">
          <text>test source</text>
        </block>
        <block type="ENTRY">
          <text>o</text>
        </block>
        <block type="ENTRY">
          <text>three</text>
        </block>
        <block type="SOURCE">
          <text>test source</text>
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>tw</text>
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
