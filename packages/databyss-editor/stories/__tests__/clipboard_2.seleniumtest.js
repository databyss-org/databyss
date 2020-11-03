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
  selectAll,
  upShiftKey,
  rightShiftKey,
  leftShiftKey,
  downShiftKey,
  sendKeys,
  leftKey,
  isSaved,
  escapeKey,
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

  it('should copy two entry fragments and paste them within an entry', async () => {
    await sendKeys(actions, 'this is a test')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'within the second block')
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)

    await upShiftKey(actions)
    await upShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)

    await copy(actions)
    await downKey(actions)
    await downKey(actions)

    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is the third block')
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await paste(actions)
    await isSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is a test</text>
        </block>
        <block type="ENTRY">
          <text>within the second block</text>
        </block>
        <block type="ENTRY">
          <text>this is the third block</text>
        </block>
        <block type="ENTRY">
          <text>is a test</text>
        </block>
        <block type="ENTRY">
          <text>
            within the second <cursor />
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

  it('should copy an atomic block and maintain atomic id integrity', async () => {
    await sendKeys(actions, '@this is a source test')
    await enterKey(actions)
    await upKey(actions)
    await rightShiftKey(actions)
    await copy(actions)
    await downKey(actions)
    await downKey(actions)
    await sendKeys(actions, 'some inbetween text')
    await enterKey(actions)
    await enterKey(actions)
    await paste(actions)
    await isSaved(driver)

    let atomic = await getElementByTag(driver, '[data-test-atomic-edit="open"]')

    await atomic.click()

    atomic = await getElementByTag(driver, '[data-test-atomic-edit="open"]')

    await atomic.click()

    const source = await getElementByTag(driver, '[data-test-path="text"]')

    // double click on atomic
    await source.click()

    await sendKeys(actions, ' with appended text')

    const doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()
    await isSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>
            this is a source test with appended text<cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>some inbetween text</text>
        </block>
        <block type="SOURCE">
          <text>this is a source test with appended text</text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should copy atomic and entry fragment and paste it on an empty block', async () => {
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'with frag')
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
    await leftShiftKey(actions)
    await copy(actions)
    await downKey(actions)
    await downKey(actions)
    await enterKey(actions)
    await enterKey(actions)
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
          <text>with frag</text>
        </block>
        <block type="SOURCE">
          <text>this is a source text</text>
        </block>
        <block type="ENTRY">
          <text>
            with<cursor />
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

  it('should select an atomic fragment and paste the whole atomic block', async () => {
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'in between text')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another source text')
    await escapeKey(actions)
    await upKey(actions)
    await selectAll(actions)
    await downShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
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
})
