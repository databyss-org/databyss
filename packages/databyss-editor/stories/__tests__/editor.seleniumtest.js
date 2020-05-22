/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import { getEditor, sleep } from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=cypress-tests--slate-5'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=cypress-tests--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('editor selenium', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-basic-osx-safari', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should input an entry, source and topic', async () => {
    await sleep(300)
    await actions.sendKeys('this is an example of an entry text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('@this is an example of a source text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('#this is an example of a topic text')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">this is an example of an entry text</block>
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
  })

  it('should allow a return within an entry', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('this should be on the same block')
    await actions.sendKeys(Key.ENTER)
    await sleep(1000)
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(500)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entry text{'\n'}this should be on the same block<cursor />
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

  it('Should not allow content change on atomic blocks', async () => {
    await sleep(300)
    await actions.sendKeys('@this is an example of a source text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('this is an entry example')
    await actions.sendKeys(Key.ARROW_UP)
    await actions.sendKeys('this text should not be allowed')
    await actions.sendKeys(Key.ARROW_DOWN)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          this is an example of a source text<cursor />
        </block>
        <block type="ENTRY">
          this is an entry example
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

  it('should allow backspace on entry', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry text')
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.perform()
    await sleep(500)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entry <cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should remove the atomic block on backspace and allow an entry', async () => {
    await sleep(300)
    await actions.sendKeys('@this is an atomic text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.sendKeys('this is an entry text')
    await actions.perform()
    await sleep(500)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entry text<cursor />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should merge two entry blocks on backspace', async () => {
    await sleep(300)
    await actions.sendKeys('this is the first entry block')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('move')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.BACK_SPACE)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is the first entry block<cursor />move
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should move the caret left and right', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry text')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entry <cursor />text
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should move the caret to the left', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry text')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entry <cursor />text
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should move the caret up and down', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry block')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('this is the second entry block')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('@source text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ARROW_UP)
    await actions.sendKeys(Key.ARROW_UP)
    await actions.sendKeys(Key.ARROW_UP)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          this is an entr<cursor />y block
        </block>
        <block type="ENTRY">this is the second entry block</block>
        <block type="SOURCE">source text</block>
        <block type="ENTRY" />
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
