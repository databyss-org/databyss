/** @jsx h */

/* eslint-disable func-names */
import h from 'slate-hyperscript'
import { By, Key } from 'selenium-webdriver'
import { startSession, WIN, CHROME } from '../../../lib/saucelabs'
import { toSlateJson } from './_helpers'
import {
  getEditor,
  cut,
  paste,
  sleep,
  copy,
  endOfLine,
  highlightSingleLine,
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
    driver = await startSession('clipboard-win-chrome-5-1', WIN, CHROME)
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

  it('cut and paste a source, entry and source', async () => {
    await sleep(1000)
    await actions.sendKeys('@this is an example of a source text')
    await actions.sendKeys(Key.ENTER).pause(100)
    await actions.sendKeys('this is an example of an entry text')
    await actions.sendKeys(Key.ENTER).pause(100)
    await actions.sendKeys('@this is the second source')
    await actions.sendKeys(Key.ENTER).pause(150)
    await highlightSingleLine(actions)
    await sleep(100)
    await highlightSingleLine(actions)
    await sleep(100)
    await highlightSingleLine(actions)
    await sleep(100)
    await cut(actions)
    await actions.sendKeys(Key.ARROW_DOWN)
    await actions.sendKeys('this is an entry')
    await paste(actions)
    await actions.perform()
    await sleep(500)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="ENTRY" data={{ refId: refIdList[0], type: 'ENTRY' }}>
            <text>this is an entry</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[1], type: 'SOURCE' }}>
            <text />
            <inline type="SOURCE">this is an example of a source text</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[2], type: 'ENTRY' }}>
            <text>this is an example of an entry text</text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[3], type: 'SOURCE' }}>
            <text />
            <inline type="SOURCE">this is the second source</inline>
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
    await actions.sendKeys(Key.ENTER).pause(150)
    await highlightSingleLine(actions)
    await sleep(100)
    await copy(actions)
    await actions.sendKeys(Key.ARROW_DOWN)
    await endOfLine(actions)
    await actions.sendKeys('this is an entry')
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await sleep(1000)
    await paste(actions)
    await actions.perform()
    await sleep(500)

    const refIdList = JSON.parse(await pageBlocks.getText()).pageBlocks.map(
      b => b.refId
    )

    const expected = toSlateJson(
      <value>
        <document>
          <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[1], type: 'ENTRY' }}>
            <text>this is an </text>
          </block>
          <block type="SOURCE" data={{ refId: refIdList[0], type: 'SOURCE' }}>
            <text />
            <inline type="SOURCE">this is a source</inline>
            <text />
          </block>
          <block type="ENTRY" data={{ refId: refIdList[3], type: 'ENTRY' }}>
            <text>entry</text>
          </block>
        </document>
      </value>
    )

    const actual = JSON.parse(await slateDocument.getText())
    expect(actual).toEqual(expected.document)
  })
})
