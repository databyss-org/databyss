/** @jsx h */

/* eslint-disable func-names */
import h from 'slate-hyperscript'
import { By, Key } from 'selenium-webdriver'
import { startSession, WIN, CHROME } from '../../../lib/saucelabs'
import { toSlateJson } from './_helpers'
import {
  endOfLine,
  endOfDoc,
  startOfDoc,
  highlightSingleSpace,
  CONTROL,
  copy,
  paste,
  sleep,
  selectAll,
} from './_helpers.selenium'

let driver
let editor
let body
let slateDocument
let pageBlocks
let actions

describe('editor selenium', () => {
  beforeEach(async done => {
    driver = await startSession('clipboard-win-chrome', WIN, CHROME)

    // TODO: THIS PORT NEEDS TO BE CHANGED TO 8080
    await driver.get(
      'http://localhost:6006/iframe.html?id=editor-tests--slate-empty'
    )
    editor = await driver.findElement(By.css('[contenteditable="true"]'))

    body = await driver.findElement(By.css('body'))
    slateDocument = await driver.findElement(By.id('slateDocument'))
    pageBlocks = await driver.findElement(By.id('pageBlocks'))
    await editor.click()
    actions = driver.actions()
    await sleep(1000)
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should copy and paste an entry block', async () => {
    await editor.sendKeys('this is an example of entry text')

    await selectAll(editor)
    await copy(actions)
    await endOfLine(actions)
    await editor.sendKeys(Key.ENTER)
    await paste(actions)
    await sleep(1000)

    // await copy(editor)
    // await sleep(100)
    // await endOfLine(editor)
    // await sleep(100)
    // await editor.sendKeys(Key.ENTER)
    // await sleep(100)
    // await paste(editor)
    // await sleep(1000)

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

  // it('should copy and paste a text fragment on a new line', async () => {
  //   await editor.sendKeys('this is an example of entry text')
  //   await startOfDoc(editor)
  //   await highlightSingleSpace(editor)
  //   await highlightSingleSpace(editor)
  //   await highlightSingleSpace(editor)
  //   await highlightSingleSpace(editor)
  //   await body.sendKeys(Key.CONTROL, 'c')
  //   await endOfLine(editor)
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys(Key.CONTROL, 'v')

  //   const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //     b => b.refId
  //   )

  //   const expected = toSlateJson(
  //     <value>
  //       <document>
  //         <block type="ENTRY" data={{ refId: refIdList[0] }}>
  //           <text>this is an example of entry text</text>
  //         </block>
  //         <block type="ENTRY" data={{ refId: refIdList[1] }}>
  //           <text>this</text>
  //         </block>
  //       </document>
  //     </value>
  //   )
  //   const actual = JSON.parse(await slateDocument.getText())
  //   expect(actual).toEqual(expected.document)
  // })

  // it('should copy and paste a source', async () => {
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('@this is an example of source text')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys(Key.CONTROL, 'a')
  //   await body.sendKeys(Key.CONTROL, 'c')
  //   await endOfDoc(editor)
  //   await editor.sendKeys(Key.CONTROL, 'v')

  //   const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //     b => b.refId
  //   )

  //   const expected = toSlateJson(
  //     <value>
  //       <document>
  //         <block type="ENTRY" data={{ refId: refIdList[0] }}>
  //           <text />
  //         </block>

  //         <block type="SOURCE" data={{ refId: refIdList[1] }}>
  //           <text />
  //           <inline type="SOURCE">this is an example of source text</inline>
  //           <text />
  //         </block>
  //         <block type="SOURCE" data={{ refId: refIdList[1] }}>
  //           <text />
  //           <inline type="SOURCE">this is an example of source text</inline>
  //           <text />
  //         </block>
  //       </document>
  //     </value>
  //   )
  //   const actual = JSON.parse(await slateDocument.getText())
  //   expect(actual).toEqual(expected.document)
  // })
})
