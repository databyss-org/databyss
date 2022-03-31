/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
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
  isAppInNotesSaved,
  sleep,
  jsx as h,
  login,
} from './util.selenium'

let driver
let editor
let slateDocument
let actions

describe('editor clipboard', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.quit()
    await sleep(100)
  })

  it('should have a multi-block selection with atomics and paste the whole atomic blocks', async () => {
    await downKey(actions())
    await sendKeys(actions(), '@this is a source text')
    await enterKey(actions())
    await sendKeys(actions(), 'in between text')
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), '@this is another source text')
    await upKey(actions())
    await selectAll(actions())
    await copy(actions())
    await downKey(actions())
    await downKey(actions())
    await paste(actions())
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

  it('should prevent a paste from occuring in an atomic', async () => {
    await downKey(actions())
    await sendKeys(actions(), '@this is a source text')
    await enterKey(actions())
    await sendKeys(actions(), 'entry text')
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await copy(actions())
    await upKey(actions())
    await paste(actions())
    await rightKey(actions())
    await rightKey(actions())
    await rightKey(actions())
    await rightKey(actions())
    await paste(actions())
    await isAppInNotesSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    await upKey(actions())
    await upKey(actions())

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
          <text>this is a source text</text>
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
    await downKey(actions())
    await sendKeys(actions(), '@this is a source text')
    await enterKey(actions())
    await leftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await cut(actions())
    // await sleep(1000)
    // await actions.click(editor).perform()
    // await actions.clear()
    await isAppInNotesSaved(driver)
    await driver.navigate().refresh()
    await getEditor(driver)

    await downKey(actions())
    await downKey(actions())
    await paste(actions())

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
          <text />
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

  it('should remove a multi-line atomic fragment on a cut', async () => {
    await downKey(actions())
    await sendKeys(actions(), 'this is an entry')
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), '@this is a source text')
    await enterKey(actions())
    await sendKeys(actions(), 'has frag')
    await leftKey(actions())
    await leftKey(actions())
    await leftKey(actions())
    await leftKey(actions())
    await leftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await leftShiftKey(actions())
    await cut(actions())
    await downKey(actions())
    await downKey(actions())
    await paste(actions())
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
            has
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
