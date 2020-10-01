/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  toggleBold,
  getElementById,
  enterKey,
  upKey,
  downKey,
  paste,
  copy,
  cut,
  selectAll,
  rightShiftKey,
  rightKey,
  sendKeys,
  leftKey,
  isSaved,
  sleep,
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
    await driver.quit()
  })

  it('should copy a whole block and paste it at the end of the same block', async () => {
    // TODO: FIX CURSOR POSITION FOR THIS TEST
    await sendKeys(actions, 'this text will be pasted with ')

    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await selectAll(actions)

    await copy(actions)

    await rightKey(actions)
    await paste(actions)
    await isSaved(driver)
    await sleep(1000)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this text will be pasted with </text>
          <text bold>bold </text>
          <text>this text will be pasted with </text>
          <text bold>bold </text>
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

  it('should copy a whole block and paste it in the middle of a block', async () => {
    await sendKeys(actions, 'this text will be pasted with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await selectAll(actions)

    await copy(actions)

    await leftKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)

    await paste(actions)
    await isSaved(driver)
    await sleep(1000)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this this text will be pasted with </text>
          <text bold>
            bold <cursor />
          </text>
          <text>text will be pasted with </text>
          <text bold>bold </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy a whole block and paste it at the start of a block', async () => {
    await sendKeys(actions, 'this text will be pasted with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await selectAll(actions)
    await copy(actions)
    await leftKey(actions)
    await paste(actions)
    await isSaved(driver)
    await sleep(1000)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    // TODO: CURSOR PLACEMENT IS OFF
    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this text will be pasted with </text>
          <text bold>
            bold <cursor />
          </text>
          <text>this text will be pasted with </text>
          <text bold>bold </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should cut an atomic in a multi block selection', async () => {
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a source text')
    await upKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await cut(actions)
    await downKey(actions)
    await paste(actions)
    await isSaved(driver)
    await sleep(1000)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is an </text>
        </block>
        <block type="ENTRY">
          <text>entry</text>
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
})
