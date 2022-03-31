/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { sanitizeEditorChildren } from './util'
import {
  sleep,
  getElementById,
  tagButtonClick,
  jsx as h,
  login,
  downKey,
  tryQuit,
} from './util.selenium'

let driver
let slateDocument
let actions

describe('new block menu actions', () => {
  beforeEach(async (done) => {
    driver = await startSession()
    await login(driver)
    actions = driver.actions()
    await downKey(actions)
    await sleep(500)
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await tryQuit(driver)
    await sleep(100)
  })

  it('should toggle a new atomics', async () => {
    await tagButtonClick('data-test-block-menu="open"', driver)

    await tagButtonClick('data-test-block-menu="SOURCE"', driver)

    await actions.sendKeys('this should be a new source')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys('sample text')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await actions.clear()

    await tagButtonClick('data-test-block-menu="open"', driver)
    await tagButtonClick('data-test-block-menu="TOPIC"', driver)

    await actions.sendKeys('this should be a new topic')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this should be a new source</text>
        </block>
        <block type="ENTRY">
          <text>sample text</text>
        </block>
        <block type="TOPIC">
          <text>this should be a new topic</text>
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
})
