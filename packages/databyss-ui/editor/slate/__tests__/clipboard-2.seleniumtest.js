/** @jsx h */

/* eslint-disable func-names */
import h from 'slate-hyperscript'
import { By, Key } from 'selenium-webdriver'
import { startSession, WIN, CHROME } from '../../../lib/saucelabs'
import { toSlateJson } from './_helpers'
import {
  endOfLine,
  startOfLine,
  endOfDoc,
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
const LOCAL_URL =
  'http://localhost:6006/iframe.html?id=cypress-tests--slate-empty'
const PROXY_URL =
  'http://0.0.0.0:8080/iframe.html?id=cypress-tests--slate-empty'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('editor selenium', () => {
  beforeEach(async done => {
    driver = await startSession('clipboard-osx-chrome-8', WIN, CHROME)
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

  it('should copy and paste and entry block and an atomic block in the middle of an entry, first line and paste fragment should merge', async () => {
    await sleep(1000)
    await actions
      .sendKeys('this is an example of entry text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('@this is an example of source text')
      .sendKeys(Key.ENTER)
      .pause(100)
    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await copy(actions)
    await endOfDoc(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await actions.perform()

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
            <text>this is an this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[4] }}>
            <text>entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste and source block and an entry block in the middle of an entry, second line and paste fragment should merge', async () => {
    await sleep(1000)
    await actions
      .sendKeys('@this is an example of source text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('this is an example of entry text')
      .sendKeys(Key.ENTER)
      .pause(100)

    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await copy(actions)
    await endOfDoc(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await actions.perform()

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>

          <block type="ENTRY" data={{ refId: refIdList[1] }}>
            <text>this is an example of entry text</text>
          </block>

          <block type="ENTRY" data={{ refId: refIdList[2] }}>
            <text>this is an </text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[4] }}>
            <text>this is an example of entry textentry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste and source block, entry block and source block in the middle of an entry, should create two new blocks', async () => {
    await sleep(1000)
    await actions
      .sendKeys('@this is an example of source text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('this is an example of entry text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('@this is a second source')
      .sendKeys(Key.ENTER)
      .pause(100)

    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await highlightSingleLine(actions)

    await copy(actions)
    await endOfDoc(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await actions.perform()

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[1] }}>
            <text>this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[2] }}>
            <text />
            <inline type="SOURCE">this is a second source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[3] }}>
            <text>this is an </text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[5] }}>
            <text>this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[2] }}>
            <text />
            <inline type="SOURCE">this is a second source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[7] }}>
            <text>entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy and paste an entry block, atomic block and entry block in the middle of an entry, should create two new blocks', async () => {
    await sleep(1000)
    await actions
      .sendKeys('this is an example of entry text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('@this is an example of source text')
      .sendKeys(Key.ENTER)
      .pause(100)
      .sendKeys('this is a second entry')
      .sendKeys(Key.ENTER)
      .pause(100)

    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await highlightSingleLine(actions)
    await copy(actions)
    await endOfDoc(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await actions.perform()

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
            <text>this is a second entry</text>
          </block>
          <block type="ENTRY" data={{ refId: refIdList[3] }}>
            <text>this is an this is an example of entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1] }}>
            <text />
            <inline type="SOURCE">this is an example of source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[5] }}>
            <text>this is a second entryentry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy an atomic block and paste at the end of an entry', async () => {
    await sleep(1000)
    await actions.sendKeys('@this is a source')
    await actions.sendKeys(Key.ENTER).pause(100)
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await actions.sendKeys('this is an entry')
    await paste(actions)
    await actions.perform()

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
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy an atomic block and paste it in the middle of an entry', async () => {
    await sleep(1000)
    await actions.sendKeys('@this is a source')
    await actions.sendKeys(Key.ENTER).pause(100)
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await paste(actions)
    await actions.perform()

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
            <text>this is an </text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[3] }}>
            <text>entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })

  it('should copy an atomic block and paste it at the end of an entry', async () => {
    await sleep(1000)
    await actions.sendKeys('@this is a source')
    await actions.sendKeys(Key.ENTER)
    await selectAll(actions)
    await copy(actions)
    await endOfLine(actions)
    await actions.sendKeys('this is an entry')
    await startOfLine(actions)
    await paste(actions)
    await actions.perform()
    await sleep(10000)

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
          <block type="SOURCE" data={{ refId: refIdList[0] }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[2] }}>
            <text>this is an entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })
})
