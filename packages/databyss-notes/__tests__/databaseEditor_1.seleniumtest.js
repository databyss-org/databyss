/** @jsx h */
/* eslint-disable func-names */
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  getEditor,
  sendKeys,
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
  getElementById,
  isAppInNotesSaved,
  enterKey,
  backspaceKey,
  jsx as h,
  login,
  downKey,
} from './util.selenium'

let driver
let editor
let slateDocument
let actions

describe('connected editor', () => {
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

  it('should test editor and database sync and functionality', async () => {
    await downKey(actions)
    await sleep(300)
    await sendKeys(actions, 'the following text should be ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold')
    await toggleBold(actions)
    await sendKeys(actions, ' the following text should be ')
    await toggleItalic(actions)
    await sendKeys(actions, 'italic')
    await toggleItalic(actions)
    await sendKeys(actions, ' and the final text should be a ')
    await toggleLocation(actions)
    await sendKeys(actions, 'location')
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
          <text>the following text should be </text>
          <text bold>bold</text>
          <text> the following text should be </text>
          <text italic>italic</text>
          <text> and the final text should be a </text>
          <text location>location</text>
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

  it('should toggle location bold and italic in entry using hotkeys', async () => {
    await downKey(actions)
    await sleep(300)
    await sendKeys(actions, 'following text should be ')
    await toggleBold(actions)
    await toggleItalic(actions)
    await sendKeys(actions, 'bold and italic ')
    await toggleItalic(actions)
    await sendKeys(actions, 'and just bold ')
    await toggleLocation(actions)
    await sendKeys(actions, 'and location with bold')
    await enterKey(actions)
    await backspaceKey(actions)
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
          <text>following text should be </text>
          <text bold italic>
            bold and italic{' '}
          </text>
          <text bold>and just bold </text>
          <text bold location>
            and location with bold
          </text>
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
})
