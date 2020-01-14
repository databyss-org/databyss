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
  getEditor,
  copy,
  paste,
  sleep,
  selectAll,
  // previousLine,
  // nextLine,
} from './_helpers.selenium'

let driver
let editor
// let body
let slateDocument
let pageBlocks
let actions
const LOCAL_URL =
  'http://localhost:6006/iframe.html?id=cypress-tests--slate-empty'
const PROXY_URL =
  'http://0.0.0.0:8080/iframe.html?id=cypress-tests--slate-empty'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('editor selenium', () => {
  beforeEach(async done => {
    driver = await startSession('clipboard-win-chrome', WIN, CHROME)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    // editor = await driver.findElement(By.css('[contenteditable="true"]'))
    editor = await getEditor(driver)

    // body = await driver.findElement(By.css('body'))
    slateDocument = await driver.findElement(By.id('slateDocument'))
    pageBlocks = await driver.findElement(By.id('pageBlocks'))
    await editor.click()
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should copy and paste an entry block', async () => {
    await editor.sendKeys('this is an example of entry text')
    await editor.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await paste(actions)
    await sleep(2000)

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

  it('should copy and paste a text fragment on a new line', async () => {
    await editor.sendKeys('this is an example of entry text')
    await startOfDoc(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await copy(actions)
    await endOfLine(actions)
    await editor.sendKeys(Key.ENTER)
    await endOfDoc(actions)
    await paste(actions)
    await sleep(1000)

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
            <text>this</text>
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste a text fragment on a same line', async () => {
    await editor.sendKeys('this is an example of entry text')
    await startOfDoc(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await highlightSingleSpace(actions)
    await copy(actions)
    await endOfLine(actions)
    await editor.sendKeys(' ')
    await paste(actions)
    await sleep(1000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }}>
            <text>this is an example of entry text this</text>
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste a source', async () => {
    await editor.sendKeys(' ')
    await editor.sendKeys(Key.BACK_SPACE)
    await editor.sendKeys('@this is an example of source text')
    await editor.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await endOfDoc(actions)
    await paste(actions)
    await sleep(1000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
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
    await editor.sendKeys('this is an example of an entry text')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is an example of a source text')
    await editor.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    // await endOfLine(actions)
    await endOfDoc(actions)
    await paste(actions)
    await sleep(1000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }}>
            <text>this is an example of an entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of a source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[2] }}>
            <text>this is an example of an entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of a source text</inline>
            <text />
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should not allow a paste on an atomic block', async () => {
    await editor.sendKeys('@this is a source')
    await editor.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    await editor.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await editor.sendKeys(Key.ARROW_RIGHT)
    await paste(actions)
    await sleep(1000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[1] }} />
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste an empty block and source block', async () => {
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('@this is a source')
    await editor.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    await endOfDoc(actions)
    await paste(actions)
    await sleep(1000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0] }} />

          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
        </document>
      </value>
    )
    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste atomic block and entry block at end of existing line at the end of the document', async () => {
    await editor.sendKeys('@this is a source')
    await editor.sendKeys(Key.ENTER)
    await editor.sendKeys('this is an entry')
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await paste(actions)
    await sleep(2000)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[1] }}>
            <text>this is an entry</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[3] }}>
            <text>this is an entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  // it('should copy and paste atomic block and entry block at end of existing line in the middle of a document', async () => {
  //   await editor.sendKeys('@this is a source')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('this is an entry')
  //   await editor.sendKeys(Key.ENTER)
  //   await editor.sendKeys('this is also an entry')
  //   await selectAll(actions)
  //   await copy(actions)
  //   await endOfDoc(actions)
  //   await paste(actions)

  //   // await editor.sendKeys(Key.ARROW_LEFT)
  //   // await editor.sendKeys(Key.ARROW_DOWN)
  //   // await editor.sendKeys(Key.ARROW_DOWN)
  //   // await editor.sendKeys(Key.ARROW_LEFT)

  //   // await paste(actions)

  //   await sleep(50000)

  //   const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //     b => b.refId
  //   )

  //   const expected = toSlateJson(
  //     <value>
  //       <document>
  //         <block type="SOURCE" data={{ refId: refIdList[0] }}>
  //           <text />
  //           <inline type="SOURCE">this is a source</inline>
  //           <text />
  //         </block>
  //         <block type="ENTRY" data={{ refId: refIdList[1] }}>
  //           <text>this is an entry</text>
  //         </block>
  //         <block type="SOURCE" data={{ refId: refIdList[0] }}>
  //           <text />
  //           <inline type="SOURCE">this is a source</inline>
  //           <text />
  //         </block>
  //         <block type="ENTRY" data={{ refId: refIdList[3] }}>
  //           <text>this is an entry</text>
  //         </block>
  //         <block type="ENTRY" data={{ refId: refIdList[4] }}>
  //           <text>this is also an entry</text>
  //         </block>
  //       </document>
  //     </value>
  //   )

  //   const actual = JSON.parse(await slateDocument.getText())
  //   expect(actual).toEqual(expected.document)
  // })
})
