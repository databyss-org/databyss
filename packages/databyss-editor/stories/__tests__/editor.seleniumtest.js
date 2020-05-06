/** @jsx jsx */
/* eslint-disable func-names */

import { jsx } from './hyperscript'
import { By, Key } from 'selenium-webdriver'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { toSlateJson } from './_helpers'
import {
  endOfLine,
  endOfDoc,
  startOfDoc,
  highlightSingleSpace,
  highlightSingleLine,
  getEditor,
  copy,
  paste,
  sleep,
  selectAll,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let pageBlocks
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
    pageBlocks = await driver.findElement(By.id('pageBlocks'))
    await editor.click()
    actions = driver.actions({ bridge: true })
    await actions.click(editor)
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should copy and paste an entry block', async () => {
    await sleep(1000)
    await actions.sendKeys('this is an example of entry text')
    await sleep(10000)
    // await actions.sendKeys(Key.ENTER).pause(100)
    // await selectAll(actions)
    // await copy(actions)
    // await endOfLine(actions)
    // await paste(actions)
    await actions.perform()

    // const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
    //   b => b.refId
    // )

    // export const toSlateJson = hyperscript => {
    //     const editor = new Editor()
    //     editor.setValue(hyperscript)
    //     return editor.value.toJSON()
    //   }

    // const expected = toSlateJson(
    //   <value>
    //     <document>
    //       <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
    //         <text>this is an example of entry text</text>
    //       </block>
    //       <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
    //         <text>this is an example of entry text</text>
    //       </block>
    //     </document>
    //   </value>
    // )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(null)
  })

  //   it('should copy and paste a text fragment on a new line', async () => {
  //     await sleep(1000)
  //     await actions.sendKeys('this is an example of entry text')
  //     await startOfDoc(actions)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await copy(actions)
  //     await endOfLine(actions)
  //     await actions.sendKeys(Key.ENTER).pause(100)
  //     await endOfDoc(actions)
  //     await paste(actions)
  //     await actions.perform()

  //     const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //       b => b.refId
  //     )

  //     const expected = toSlateJson(
  //       <value>
  //         <document>
  //           <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
  //             <text>this is an example of entry text</text>
  //           </block>
  //           <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
  //             <text>this</text>
  //           </block>
  //         </document>
  //       </value>
  //     )
  //     const actual = JSON.parse(await slateDocument.getText())
  //     expect(actual).toEqual(expected.document)
  //   })

  //   it('should copy and paste a text fragment on a same line', async () => {
  //     await sleep(1000)
  //     await actions.sendKeys('this is an example of entry text')
  //     await startOfDoc(actions)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await highlightSingleSpace(actions)
  //     await sleep(100)
  //     await copy(actions)
  //     await endOfLine(actions)
  //     await actions.sendKeys(' ')
  //     await paste(actions)
  //     await actions.perform()

  //     const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //       b => b.refId
  //     )

  //     const expected = toSlateJson(
  //       <value>
  //         <document>
  //           <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
  //             <text>this is an example of entry text this</text>
  //           </block>
  //         </document>
  //       </value>
  //     )
  //     const actual = JSON.parse(await slateDocument.getText())
  //     expect(actual).toEqual(expected.document)
  //   })

  //   it('should copy and paste an entry block, atomic block and entry block in the middle of an entry, should create two new blocks', async () => {
  //     await sleep(1000)
  //     await actions
  //       .sendKeys('this is an example of entry text')
  //       .sendKeys(Key.ENTER)
  //       .pause(100)
  //       .sendKeys('@this is an example of source text')
  //       .sendKeys(Key.ENTER)
  //       .pause(100)
  //       .sendKeys('this is a second entry')
  //       .sendKeys(Key.ENTER)
  //       .pause(100)

  //     await highlightSingleLine(actions)
  //     await sleep(100)
  //     await highlightSingleLine(actions)
  //     await sleep(100)
  //     await highlightSingleLine(actions)
  //     await sleep(100)
  //     await copy(actions)
  //     await actions.sendKeys(Key.ARROW_RIGHT)
  //     await endOfDoc(actions)
  //     await actions.sendKeys('this is an entry')
  //     await actions.sendKeys(Key.ARROW_LEFT)
  //     await actions.sendKeys(Key.ARROW_LEFT)
  //     await actions.sendKeys(Key.ARROW_LEFT)
  //     await actions.sendKeys(Key.ARROW_LEFT)
  //     await actions.sendKeys(Key.ARROW_LEFT)
  //     await sleep(1000)
  //     await paste(actions)
  //     await actions.perform()

  //     const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
  //       b => b.refId
  //     )

  //     const expected = toSlateJson(
  //       <value>
  //         <document>
  //           <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
  //             <text>this is an example of entry text</text>
  //           </block>
  //           <block type="SOURCE" data={{ refId: refIdList[1], type: 'SOURCE' }}>
  //             <text />
  //             <inline type="SOURCE">this is an example of source text</inline>
  //             <text />
  //           </block>
  //           <block type="ENTRY" data={{ refId: refIdList[2], type: 'ENTRY' }}>
  //             <text>this is a second entry</text>
  //           </block>
  //           <block type="ENTRY" data={{ refId: refIdList[3], type: 'ENTRY' }}>
  //             <text>this is an this is an example of entry text</text>
  //           </block>
  //           <block type="SOURCE" data={{ refId: refIdList[1], type: 'SOURCE' }}>
  //             <text />
  //             <inline type="SOURCE">this is an example of source text</inline>
  //             <text />
  //           </block>
  //           <block type="ENTRY" data={{ refId: refIdList[5], type: 'ENTRY' }}>
  //             <text>this is a second entryentry</text>
  //           </block>
  //         </document>
  //       </value>
  //     )

  //     const actual = JSON.parse(await slateDocument.getText())
  //     expect(actual).toEqual(expected.document)
  //   })
})
