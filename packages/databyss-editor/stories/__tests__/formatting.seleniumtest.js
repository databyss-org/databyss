/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h, withTest } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
} from './_helpers.selenium'
import { Editor } from 'slate'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=cypress-tests--slate-5'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=cypress-tests--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('format text in editor', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-basic-osx-safari', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    await editor.click()
    actions = driver.actions({ bridge: true })
    await actions.click(editor)
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('toggle bold in entry using hotkeys', async () => {
    await sleep(300)
    await editor.sendKeys('following text should be ')
    await toggleBold(actions)
    await editor.sendKeys('bold')
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
          <text bold>bold</text>
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

  it('should toggle italic in entry using hotkeys', async () => {
    await sleep(300)
    await editor.sendKeys('following text should be ')
    await toggleItalic(actions)
    await editor.sendKeys('italic')
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
          <text italic>italic</text>
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

  it('should toggle location in entry using hotkeys', async () => {
    await sleep(300)
    await editor.sendKeys('following text should be ')
    await toggleLocation(actions)
    await editor.sendKeys('location')
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
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
    await sleep(300)
    await editor.sendKeys('following text should be ')
    await toggleItalic(actions)
    await editor.sendKeys('italic ')
    await toggleBold(actions)
    await editor.sendKeys('and bold ')
    await toggleItalic(actions)
    await toggleLocation(actions)
    await editor.sendKeys('and location')
    await sleep(5000)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
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
})
