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
  sleep,
  toggleBold,
  toggleItalic,
  toggleLocation,
  getElementById,
  enterKey,
  upKey,
  downKey,
  backspaceKey,
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

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('connected editor', () => {
  beforeEach(async done => {
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

    done()
  })

  afterEach(async () => {
    const clearButton = await getElementById(driver, 'clear-state')
    await clearButton.click()
    await driver.navigate().refresh()

    // sleep(500)
    await driver.quit()
  })

  it('should toggle bold and save changes', async () => {
    await sleep(300)
    await actions.sendKeys('the following text should be ')
    await toggleBold(actions)
    await actions.sendKeys('bold')
    await actions.perform()
    await sleep(3000)

    await driver.navigate().refresh()

    await sleep(300)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>the following text should be </text>
          <text bold>bold</text>
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

  it('should toggle italic and save changes', async () => {
    await sleep(300)
    await actions.sendKeys('the following text should be ')
    await toggleItalic(actions)
    await actions.sendKeys('italic')
    await actions.perform()
    await sleep(7000)

    await driver.navigate().refresh()

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>the following text should be </text>
          <text italic>italic</text>
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

  it('should toggle location and save changes', async () => {
    await sleep(300)
    await actions.sendKeys('the following text should be ')
    await toggleLocation(actions)
    await actions.sendKeys('location')
    await actions.perform()
    await sleep(7000)

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>the following text should be </text>
          <text location>location</text>
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

  it('should toggle location bold and italic in entry using hotkeys', async () => {
    await sleep(300)
    await actions.sendKeys('following text should be ')
    await toggleBold(actions)
    await toggleItalic(actions)
    await actions.sendKeys('bold and italic ')
    await toggleItalic(actions)
    await actions.sendKeys('and just bold ')
    await toggleLocation(actions)
    await actions.sendKeys('and location with bold')
    await actions.perform()
    await sleep(15000)

    await driver.navigate().refresh()

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>following text should be </text>
          <text bold italic>
            bold and italic{' '}
          </text>
          <text bold>and just bold </text>
          <text bold location>
            and location with bold
          </text>
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

  // TODO: THIS TEST FAILS BECAUSE OF THE SINGLE LINE SLATE EDITOR
  it('should insert atomic source and edit source fields', async () => {
    await sleep(300)
    await actions.sendKeys('@this is a test')
    await actions.sendKeys(Key.ENTER)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ARROW_LEFT)
    await actions.sendKeys(Key.ENTER)
    await actions.perform()
    await actions.clear()
    await sleep(1000)

    const name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    await actions.sendKeys(Key.ARROW_RIGHT)

    await actions.sendKeys('\t')

    await actions.sendKeys('new citation')
    await actions.sendKeys('\t')

    await actions.sendKeys('authors first name')

    await actions.sendKeys('\t')

    await actions.sendKeys('authors last name')
    await actions.sendKeys('\t')
    await actions.sendKeys('\t')

    await actions.perform()

    let doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()

    await sleep(1000)

    // refresh page
    await driver.navigate().refresh()

    editor = await getEditor(driver)
    await editor.sendKeys(Key.ARROW_LEFT)
    await editor.sendKeys(Key.ENTER)

    let citationsField = await getElementById(driver, 'citation')

    citationsField = await citationsField.getText()

    let firstName = await getElementById(driver, 'firstName')

    firstName = await firstName.getAttribute('value')

    let lastName = await getElementById(driver, 'lastName')

    lastName = await lastName.getAttribute('value')

    doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )

    await sleep(1000)
    await doneButton.click()
    await sleep(2000)

    assert.equal(citationsField, 'new citation')

    assert.equal(firstName, 'authors first name')

    assert.equal(lastName, 'authors last name')

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="SOURCE">
          <text>
            this is a test<cursor />
          </text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
      </editor>
    )
    // check if editor has correct value
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })

  it('should test data integrity in round trip testing', async () => {
    await sleep(300)
    await actions.sendKeys('this is an entry with ')
    await toggleBold(actions)
    await actions.sendKeys('bold')
    await toggleBold(actions)
    await enterKey(actions)
    await actions.sendKeys('still within the same block')
    await enterKey(actions)
    await enterKey(actions)
    await actions.sendKeys('@this should toggle a source block')
    await enterKey(actions)
    await upKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await actions.sendKeys('#this should toggle a topics block')
    await enterKey(actions)
    await actions.sendKeys('this entry is within two atomics')
    await enterKey(actions)
    await enterKey(actions)
    await backspaceKey(actions)
    await actions.sendKeys(' appended text')
    //  await upKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await actions.sendKeys('second middle entry')
    await enterKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await upKey(actions)
    await backspaceKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)
    await downKey(actions)

    await actions.sendKeys('last entry')
    await actions.perform()
    await sleep(20000)

    // refresh page
    await driver.navigate().refresh()

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is an entry with </text>
          <text bold>bold{'\n'}</text>
          <text>still within the same block</text>
        </block>
        <block type="TOPIC">
          <text>this should toggle a topics block</text>
        </block>
        <block type="ENTRY">
          <text>this entry is within two atomics appended text</text>
        </block>
        <block type="ENTRY">
          <text>second middle entry</text>
        </block>
        <block type="ENTRY">
          <text />
        </block>
        <block type="SOURCE">
          <text>this should toggle a source block</text>
        </block>
        <block type="ENTRY">
          <text>
            last entry<cursor />
          </text>
        </block>
      </editor>
    )
    // // check if editor has correct value
    assert.deepEqual(
      sanitizeEditorChildren(actual.children),
      sanitizeEditorChildren(expected.children)
    )

    assert.deepEqual(actual.selection, expected.selection)
  })
})
