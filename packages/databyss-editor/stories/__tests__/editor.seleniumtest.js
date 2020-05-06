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
})
