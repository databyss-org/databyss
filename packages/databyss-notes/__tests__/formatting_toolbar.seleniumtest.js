/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
  singleHighlight,
  getElementById,
  tagButtonClick,
  jsx as h,
  login,
  downKey,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('format text in editor', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    await downKey(actions)
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.quit()
    await sleep(100)
  })

  it('should toggle italic using the format toolbar', async () => {
    await sleep(300)
    await actions.sendKeys('first word should be italic')
    await actions.sendKeys(Key.ARROW_UP)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await actions.perform()
    await sleep(1000)

    await tagButtonClick('data-test-format-menu="italic"', driver)

    await sleep(3000)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text italic>
            <anchor />
            first
            <focus />
          </text>
          <text> word should be italic</text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should toggle location using the format toolbar', async () => {
    await sleep(300)
    await actions.sendKeys('first word should be location')
    await actions.sendKeys(Key.ARROW_UP)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await singleHighlight(actions)
    await actions.perform()
    await sleep(1000)

    await tagButtonClick('data-test-format-menu="location"', driver)

    await sleep(300)
    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text location>
            <anchor />
            first
            <focus />
          </text>
          <text> word should be location</text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should toggle a bold and italic within a source', async () => {
    await sleep(300)
    await actions.sendKeys('@this should be ')
    await toggleBold(actions)
    await actions.sendKeys('bold ')
    await toggleItalic(actions)
    await actions.sendKeys('and italic')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(500)
    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this should be </text>
          <text bold>bold </text>
          <text bold italic>
            and italic
          </text>
        </block>
        <block type="ENTRY">
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

  it('should not allow locations on sources, allow italic and bold', async () => {
    await sleep(300)
    await actions.sendKeys('@this should not be ')
    await toggleLocation(actions)
    await actions.sendKeys('a location ')
    await toggleBold(actions)
    await toggleItalic(actions)
    await actions.sendKeys('and allow italic and bold')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(500)
    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this should not be a location </text>
          <text bold italic>
            and allow italic and bold
          </text>
        </block>
        <block type="ENTRY">
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
