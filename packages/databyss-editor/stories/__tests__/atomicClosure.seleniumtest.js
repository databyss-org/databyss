/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sendKeys,
  enterKey,
  sleep,
  getElementById,
  upKey,
  backspaceKey,
  leftKey,
} from './_helpers.selenium'

let driver
let editor
let slateDocument
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=services-auth--login'

const LOCAL_URL_EDITOR =
  'http://localhost:6006/iframe.html?id=services-page--slate-5'
const PROXY_URL_EDITOR =
  'http://0.0.0.0:8080/iframe.html?id=services-page--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('atomic closure', () => {
  beforeEach(async done => {
    const random = Math.random()
      .toString(36)
      .substring(7)
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    const emailField = await getElementByTag(driver, '[data-test-path="email"]')
    await emailField.sendKeys(`${random}@test.com`)

    let continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )
    await continueButton.click()

    const codeField = await getElementByTag(driver, '[data-test-path="code"]')
    await codeField.sendKeys('test-code-42')

    continueButton = await getElementByTag(
      driver,
      '[data-test-id="continueButton"]'
    )
    await continueButton.click()

    await getElementByTag(driver, '[data-test-id="logoutButton"]')

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    actions = driver.actions()
    await actions.click(editor)
    await actions.perform()
    await actions.clear()

    done()
  })

  afterEach(async () => {
    const clearButton = await getElementById(driver, 'clear-state')
    await clearButton.click()
    await driver.navigate().refresh()

    await driver.quit()
  })

  /* 
  TODO:
  - open source, close source, close source before other closure, check for last closure to be deleted
  */

  it('should open and close source and topics', async () => {
    await sendKeys(actions, '@this is an opening source')
    await enterKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>
            /# this is a topic<cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    // close source
    await enterKey(actions)
    await sendKeys(actions, '/@')
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>/# this is a topic</text>
        </block>
        <block type="END_SOURCE">
          <text>
            /@ this is an opening source<cursor />
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

  it('should delete a closure on atomic deletion', async () => {
    await sendKeys(actions, '@this is an opening source')
    await enterKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>
            /# this is a topic<cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await sleep(300)

    // remove topic closure
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await backspaceKey(actions)
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="ENTRY">
          <text>
            <cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should overwrite a previously closed atomic', async () => {
    await sendKeys(actions, '@this is an opening source')
    await enterKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is another entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    let actual = JSON.parse(await slateDocument.getText())

    let expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>
            /# this is a topic<cursor />
          </text>
        </block>
      </editor>
    )

    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)

    await sleep(300)

    // overwrite existing closure

    await enterKey(actions)
    await upKey(actions)
    await upKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await sendKeys(actions, '/#')

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    actual = JSON.parse(await slateDocument.getText())

    expected = (
      <editor>
        <block type="SOURCE">
          <text>this is an opening source</text>
        </block>
        <block type="ENTRY">
          <text>this is an entry</text>
        </block>
        <block type="TOPIC">
          <text>this is a topic</text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="END_TOPIC">
          <text>
            /# this is a topic<cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text>this is another entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="ENTRY">
          <text />
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
