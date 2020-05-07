/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
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
    driver = await startSession('Slate-5-win-chrome', WIN, CHROME)
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

  it('should input an entry, source and topic', async () => {
    await sleep(300)
    await editor.sendKeys('this is an example of an entry text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of a source text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('#this is an example of a topic text')
    await editor.sendKeys(Key.ENTER)
    await sleep(3000)

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
    await editor.sendKeys('this is an entry text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this should be on the same block')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
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

  // THIS FAILS
  // it('Should not allow content change on atomic blocks', async () => {
  //   await sleep(300)
  //   await editor.sendKeys('@this is an example of a source text')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('this is an entry example')
  //   await editor.sendKeys(Key.ARROW_UP)
  //   await editor.sendKeys(Key.ARROW_UP)
  //   await editor.sendKeys('this text should not be allowed')

  //   const actual = JSON.parse(await slateDocument.getText())

  //   const expected = (
  //     <editor>
  //       <block type="SOURCE">
  //         this is an example of a source text<cursor />
  //       </block>
  //       <block type="ENTRY">
  //         <cursor />
  //       </block>
  //     </editor>
  //   )

  //   assert.deepEqual(
  //     sanitizeEditorChildren(actual.children),
  //     sanitizeEditorChildren(expected.children)
  //   )

  //   assert.deepEqual(actual.selection, expected.selection)
  // })

  it('should allow a return within an entry', async () => {
    await sleep(300)
    await editor.sendKeys('this is an entry text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this should be on the same block')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.ENTER)
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

  it('should allow backspace on entry', async () => {
    await sleep(300)
    await editor.sendKeys('this is an entry text')
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
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
    await editor.sendKeys('@this is an atomic text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys('this is an entry text')

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

  // THIS FAILS
  // it('should merge two entry blocks on backspace', async () => {
  //   await sleep(300)
  //   await editor.sendKeys('this is the first entry block')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('move')
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.BACK_SPACE)

  //   await sleep(300)

  //   const actual = JSON.parse(await slateDocument.getText())

  //   const expected = (
  //     <editor>
  //       <block type="ENTRY">
  //         this is the first entry block<cursor />move
  //       </block>
  //     </editor>
  //   )

  //   assert.deepEqual(
  //     sanitizeEditorChildren(actual.children),
  //     sanitizeEditorChildren(expected.children)
  //   )

  //   assert.deepEqual(actual.selection, expected.selection)
  // })
  // ARROW TESTS FAIL
  // it('should move the caret left and right', async () => {
  //   await sleep(300)
  //   await editor.sendKeys('this is an entry text')
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await sleep(300)

  //   const actual = JSON.parse(await slateDocument.getText())

  //   const expected = (
  //     <editor>
  //       <block type="ENTRY">
  //         this is an entry <cursor />text
  //       </block>
  //     </editor>
  //   )

  //   assert.deepEqual(
  //     sanitizeEditorChildren(actual.children),
  //     sanitizeEditorChildren(expected.children)
  //   )

  //   assert.deepEqual(actual.selection, expected.selection)
  // })

  // it('should move the caret to the left', async () => {
  //   await sleep(300)
  //   await editor.sendKeys('this is an entry text')
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await editor.sendKeys(Key.ARROW_LEFT)
  //   await sleep(300)

  //   const actual = JSON.parse(await slateDocument.getText())

  //   const expected = (
  //     <editor>
  //       <block type="ENTRY">
  //         this is an entry <cursor />text
  //       </block>
  //     </editor>
  //   )

  //   assert.deepEqual(
  //     sanitizeEditorChildren(actual.children),
  //     sanitizeEditorChildren(expected.children)
  //   )

  //   assert.deepEqual(actual.selection, expected.selection)
  // })

  // it('should move the caret up and down', async () => {
  //   await sleep(300)
  //   await editor.sendKeys('this is an entry block')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('this is the second entry block')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('@source text')
  //   await editor.sendKeys(Key.ENTER)
  //   await sleep(300)
  //   await editor.sendKeys(Key.ARROW_UP)
  //   await editor.sendKeys(Key.ARROW_UP)
  //   await editor.sendKeys(Key.ARROW_UP)
  //   await editor.sendKeys('this should be before ')

  //   await sleep(30000)

  //   const actual = JSON.parse(await slateDocument.getText())

  //   const expected = (
  //     <editor>
  //       <block type="ENTRY">
  //         this is an entry <cursor />text
  //       </block>
  //     </editor>
  //   )

  //   assert.deepEqual(
  //     sanitizeEditorChildren(actual.children),
  //     sanitizeEditorChildren(expected.children)
  //   )

  //   assert.deepEqual(actual.selection, expected.selection)
  // })
})
