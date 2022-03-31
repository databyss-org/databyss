/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
  toggleBold,
  getElementById,
  enterKey,
  upKey,
  downKey,
  paste,
  copy,
  sleep,
  cut,
  selectAll,
  rightShiftKey,
  rightKey,
  sendKeys,
  leftKey,
  escapeKey,
  leftShiftKey,
  jsx as h,
  login,
  isAppInNotesSaved,
  upShiftKey,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('editor clipboard', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.tryQuit()
    await sleep(100)
  })

  it('should copy a whole block and paste it at the end of the same block', async () => {
    await downKey(actions)
    // TODO: FIX CURSOR POSITION FOR THIS TEST
    await sendKeys(actions, 'this text will be pasted with ')

    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await upShiftKey(actions)
    await rightShiftKey(actions)

    await copy(actions)

    await rightKey(actions)
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
    await downKey(actions)
    await sendKeys(actions, 'this text will be pasted with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await upShiftKey(actions)
    await rightShiftKey(actions)

    await copy(actions)

    await leftKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)
    await rightKey(actions)

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
    await downKey(actions)
    await sendKeys(actions, 'this text will be pasted with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold ')
    await upShiftKey(actions)
    await rightShiftKey(actions)
    await copy(actions)
    await leftKey(actions)
    await paste(actions)
    await isAppInNotesSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    // TODO: CURSOR PLACEMENT IS OFF
    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
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
    await downKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a source text')
    await escapeKey(actions)
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
          <text>this is an </text>
        </block>
        <block type="ENTRY">
          <text>entry</text>
        </block>
        <block type="SOURCE">
          <text>
            this is a source text
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

  it('should test inline atomic functionality', async () => {
    await downKey(actions)
    // paste in inline range
    await toggleBold(actions)
    await sendKeys(actions, 'some topic')
    await upShiftKey(actions)
    await rightShiftKey(actions)
    await copy(actions)
    await sendKeys(actions, 'and we append #')
    await paste(actions)
    await sleep(1000)
    await enterKey(actions)
    // copy fraction of an inline
    await leftShiftKey(actions)
    await leftShiftKey(actions)
    await copy(actions)
    await rightKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await paste(actions)
    await sleep(1000)

    // block pasting multiple blocks
    await enterKey(actions)
    await enterKey(actions)
    await selectAll(actions)
    await copy(actions)
    await rightKey(actions)
    await sendKeys(actions, 'this should block #')
    await paste(actions)
    await sleep(1000)

    await enterKey(actions)
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const _id = actual.children[1].children[1].atomicId

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text bold>and we append </text>
          <text inlineTopic atomicId={_id}>
            #some topic
          </text>
        </block>
        <block type="ENTRY">
          <text inlineTopic atomicId={_id}>
            #some topic
          </text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text>
            this should block #<cursor />
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
