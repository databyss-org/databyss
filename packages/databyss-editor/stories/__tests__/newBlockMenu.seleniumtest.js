/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  sleep,
  getElementById,
  tagButtonClick,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=selenium-tests--slate-5'
const PROXY_URL = 'http://localhost:8080/iframe.html?id=selenium-tests--slate-5'

describe('new block menu actions', () => {
  beforeEach(async (done) => {
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    await editor.click()
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await sleep(100)
    await driver.quit()
    driver = null
    await sleep(100)
  })

  it('should toggle a new atomics', async () => {
    await sleep(300)

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
