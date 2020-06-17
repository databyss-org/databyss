/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import { getEditor, sleep } from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=cypress-tests--slate-5'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=cypress-tests--slate-5'

describe('new block menu actions', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-formatting-osx-safari', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    editor = await getEditor(driver)

    slateDocument = await driver.findElement(By.id('slateDocument'))
    await editor.click()
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should toggle a new source', async () => {
    await sleep(300)
    await driver
      .findElement(By.tagName('[data-test-block-menu="open"]'))
      .click()
    await driver
      .findElement(By.tagName('[data-test-block-menu="SOURCE"]'))
      .click()
    await actions.sendKeys('this should be a new source')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(300)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>this should be a new source</text>
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

  it('should toggle a new topic', async () => {
    await sleep(300)
    await driver
      .findElement(By.tagName('[data-test-block-menu="open"]'))
      .click()
    await driver
      .findElement(By.tagName('[data-test-block-menu="TOPIC"]'))
      .click()
    await actions.sendKeys('this should be a new topic')
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await sleep(500)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
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

  it('should tag a location block', async () => {
    await sleep(300)
    await driver
      .findElement(By.tagName('[data-test-block-menu="open"]'))
      .click()
    await driver
      .findElement(By.tagName('[data-test-block-menu="LOCATION"]'))
      .click()
    await actions.sendKeys('this should be a location')
    await actions.perform()
    await sleep(3000)

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text location>
            this should be a location<cursor />
          </text>
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
