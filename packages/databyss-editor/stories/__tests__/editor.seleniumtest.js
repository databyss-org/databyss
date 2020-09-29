/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import { getEditor, sleep } from './_helpers.selenium'

let driver
let editor
let slateDocument

// let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=selenium-tests--slate-5'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=selenium-tests--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('editor selenium', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    //   actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should test basic editor functionality', async () => {
    await sleep(300)
    await editor.sendKeys('this is an example of an entry text')
    // allow a single return within an entry
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this should be on the same block')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of a source text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('#this is an example of a topic text')
    await editor.sendKeys(Key.ENTER)
    await sleep(300)

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
          block
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">this is an example of a topic text</block>
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

    // should not allow content change on atomic blocks
    await editor.sendKeys(Key.ARROW_UP)
    await sleep(300)
    await editor.sendKeys('this text should not be allowed')
    await sleep(300)

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
          block
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">
          <cursor />this is an example of a topic text
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

    // should allow backspace on an entry
    await editor.sendKeys(Key.ARROW_UP)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_LEFT)
    await sleep(300)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)

    await sleep(300)

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same<cursor />
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="TOPIC">this is an example of a topic text</block>
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

    // should remove the atomic block on backspace and allow an entry
    await editor.sendKeys(Key.ARROW_RIGHT)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_DOWN)
    await sleep(300)
    await editor.sendKeys(Key.ARROW_LEFT)
    await sleep(300)
    await editor.sendKeys(Key.BACK_SPACE)
    await sleep(300)
    await editor.sendKeys('this entry replaces a topic')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="ENTRY">
          this entry replaces a topic<cursor />
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
    // should merge two entry blocks on backspace
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(' move')
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.BACK_SPACE)
    await sleep(3000)

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="ENTRY">
          this is an example of an entry text{'\n'}this should be on the same
        </block>
        <block type="SOURCE">this is an example of a source text</block>
        <block type="ENTRY">
          this entry replaces a topic<cursor /> move
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
