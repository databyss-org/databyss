/** @jsx h */

/* eslint-disable func-names */

import h from 'slate-hyperscript'
import { By, Key } from 'selenium-webdriver'
import { startSession, WIN, CHROME } from '../../../lib/saucelabs'
import { toSlateJson } from './_helpers'
import { endOfLine, endOfDoc } from './_helpers.selenium'

let driver
let editor
let body
let slateDocument
let pageBlocks

describe('editor selenium', () => {
  beforeEach(async () => {
    driver = await startSession('clipboard-win-chrome', WIN, CHROME)
    await driver.get(
      'http://0.0.0.0:8080/iframe.html?id=editor-tests--slate-empty'
    )
    editor = await driver.findElement(By.css('[contenteditable="true"]'))
    body = await driver.findElement(By.css('body'))
    slateDocument = await driver.findElement(By.id('slateDocument'))
    pageBlocks = await driver.findElement(By.id('pageBlocks'))
    await editor.click()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should copy and paste an entry', async () => {
    await editor.sendKeys('this is an example of entry text')
    await editor.sendKeys(Key.CONTROL, 'a')
    await body.sendKeys(Key.CONTROL, 'c')
    await endOfLine(editor)
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.CONTROL, 'v')

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }}>
            <text>this is an example of entry text</text>
          </block>
          <block type="ENTRY" data={{ refId: refIdList[1] }}>
            <text>this is an example of entry text</text>
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste a source', async () => {
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of source text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.CONTROL, 'a')
    await body.sendKeys(Key.CONTROL, 'c')
    await endOfDoc(editor)
    await editor.sendKeys(Key.CONTROL, 'v')

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }}>
            <text />
          </block>

          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste an entry and a source', async () => {
    await editor.sendKeys('this is an example of entry text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of source text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys(Key.CONTROL, 'a')
    await body.sendKeys(Key.CONTROL, 'c')
    await endOfDoc(editor)
    await editor.sendKeys(Key.CONTROL, 'v')

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }}>
            <text>this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[2] }}>
            <text>this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })
})
