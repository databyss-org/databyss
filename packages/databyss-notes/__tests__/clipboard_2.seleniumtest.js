/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
  getElementById,
  enterKey,
  upKey,
  downKey,
  paste,
  copy,
  upShiftKey,
  rightShiftKey,
  leftShiftKey,
  downShiftKey,
  sendKeys,
  leftKey,
  isAppInNotesSaved,
  escapeKey,
  sleep,
  tagButtonClick,
  jsx as h,
  login,
  tagButtonListClick,
  tryQuit,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('editor clipboard', () => {
  beforeEach(async (done) => {
    driver = await startSession()
    await login(driver)
    actions = driver.actions()
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
  })

  it('should copy two entry fragments and paste them within an entry', async () => {
    await downKey(actions)
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
    await isAppInNotesSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
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
          <text> is a test</text>
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
    await downKey(actions)
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
    await isAppInNotesSaved(driver)

    await tagButtonClick('data-test-atomic-edit="open"', driver)

    await sleep(1000)

    await tagButtonClick('data-test-path="text"', driver)
    await downKey(actions)

    await sendKeys(actions, ' with appended text')

    await sleep(1000)

    await tagButtonListClick(
      'data-test-element="index-result-links"',
      0,
      driver
    )

    await isAppInNotesSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)
    upKey(actions)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>
            <cursor />
          </text>
        </block>
        <block type="SOURCE">
          <text>this is a source test with appended text</text>
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
  })

  it('should copy atomic and entry fragment and paste it on an empty block', async () => {
    await downKey(actions)
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
    await isAppInNotesSaved(driver)

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
            with
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

  it('should select an atomic fragment and paste the whole atomic block', async () => {
    await downKey(actions)
    await sendKeys(actions, '@this is a source text')
    await enterKey(actions)
    await sendKeys(actions, 'in between text')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another source text')
    await escapeKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await downKey(actions)
    await downShiftKey(actions)
    await downShiftKey(actions)
    await downShiftKey(actions)
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await copy(actions)
    await downKey(actions)
    await paste(actions)
    await isAppInNotesSaved(driver)

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
            this is another source text
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
})
