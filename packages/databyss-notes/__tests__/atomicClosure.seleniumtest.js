/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
  sendKeys,
  enterKey,
  sleep,
  getElementById,
  upKey,
  backspaceKey,
  leftKey,
  jsx as h,
  login,
  isAppInNotesSaved,
  tryQuit,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('atomic closure', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await tryQuit(driver)
    driver = null
    await sleep(100)
  })

  it('should open, close, overwrite and delete source and topics', async () => {
    await enterKey(actions)
    await sendKeys(actions, '@this is an opening source')
    await enterKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sleep(1000)

    await isAppInNotesSaved(driver)

    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>/# this is a topic</text>
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

    // close source
    await sleep(300)
    await sendKeys(actions, '/@')
    await sleep(1000)

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
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>/# this is a topic</text>
        </block>
        <block type="END_SOURCE">
          <text>/@ this is an opening source</text>
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

    // should delete a closure on atomic deletion
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await backspaceKey(actions)
    await sleep(1000)

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
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="END_SOURCE">
          <text>/@ this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // should overwrite a previously closed atomic
    await sleep(300)
    await sendKeys(actions, '/@')
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
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="END_SOURCE">
          <text>/@ this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
            this is another entry
          </text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text />
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
