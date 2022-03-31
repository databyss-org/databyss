/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
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
  isAppInNotesSaved,
  jsx as h,
  login,
  downKey,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('editor history', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    await downKey(actions)
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.tryQuit()
    await sleep(100)
  })

  it('should undo a multiblock entry with an atomic', async () => {
    await sleep(300)
    await sendKeys(actions, 'this entry should stay')
    await enterKey(actions)
    await enterKey(actions)
    await isAppInNotesSaved(driver)
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
    await isAppInNotesSaved(driver)
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
    await isAppInNotesSaved(driver)

    // checks before redo
    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
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
    await isAppInNotesSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
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
    await isAppInNotesSaved(driver)

    // checks before redo
    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text>
            one
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

    await redo(actions)
    await redo(actions)
    await isAppInNotesSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
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
