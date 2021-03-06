/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
  singleHighlight,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=selenium-tests--slate-5'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=selenium-tests--slate-5'

// export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('format text in editor', () => {
  beforeEach(async (done) => {
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.quit()
    driver = null
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
    await actions.perform()
    await sleep(1000)
    await driver
      .findElement(By.tagName('[data-test-format-menu="italic"]'))
      .click()

    await sleep(3000)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
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
    await actions.perform()
    await sleep(1000)
    await driver
      .findElement(By.tagName('[data-test-format-menu="location"]'))
      .click()

    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
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

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
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

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
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
