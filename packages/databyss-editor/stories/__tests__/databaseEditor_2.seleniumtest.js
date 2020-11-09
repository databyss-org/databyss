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
  getElementsByTag,
  sendKeys,
  sleep,
  toggleBold,
  getElementById,
  enterKey,
  upKey,
  downKey,
  backspaceKey,
  tabKey,
  leftKey,
  rightKey,
  isSaved,
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

describe('connected editor', () => {
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
    await sleep(100)
    await driver.quit()
    driver = null
    await sleep(100)
  })

  it('should insert atomic source and edit source fields and test for suggestions', async () => {
    await sleep(300)
    await sendKeys(actions, '@this is a test')
    // verify if there are no suggestions the suggestion menu appears
    await getElementByTag(driver, '[data-test-block-menu="OPEN_LIBRARY"]')
    await getElementByTag(driver, '[data-test-block-menu="CROSSREF"]')
    await getElementByTag(driver, '[data-test-block-menu="GOOGLE_BOOKS"]')
    await enterKey(actions)

    // populate with dummy text and other sources
    await sendKeys(actions, 'dummy text')
    await enterKey(actions)
    await enterKey(actions)
    // Suggestions don't break with strange characters (i.e. "[" "\" etc.)
    await sendKeys(actions, '@test [this] second \\ source')

    await enterKey(actions)
    await sendKeys(actions, 'this is more dummy text')
    await enterKey(actions)
    await enterKey(actions)

    await sendKeys(actions, '@test this')

    // verify both the sources appear in suggestions
    const suggestions = await getElementsByTag(
      driver,
      '[data-test-element="suggested-menu-sources"]'
    )

    assert.equal(suggestions.length, 2)
    // suggestions might not be in the same order
    const _firstSuggestion = await suggestions[0].getText()
    const _secondSuggestion = await suggestions[1].getText()

    const suggestionIndex = [_firstSuggestion, _secondSuggestion].findIndex(
      s => s === 'this is a test'
    )

    // click on existing source
    await suggestions[suggestionIndex].click()
    await isSaved(driver)

    // refresh page
    await driver.navigate().refresh()

    // navigate into the source modal and populate fields
    await getEditor(driver)

    await leftKey(actions)
    await leftKey(actions)
    await enterKey(actions)

    const name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    await rightKey(actions)
    await tabKey(actions)
    await sendKeys(actions, 'new citation')
    await tabKey(actions)
    await tabKey(actions)

    await sendKeys(actions, 'authors last name')
    await tabKey(actions)
    await sendKeys(actions, 'authors first name')
    await tabKey(actions)
    await tabKey(actions)

    let doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()

    await isSaved(driver)
    await sleep(1000)

    // refresh page
    await driver.navigate().refresh()

    // navigate into first source and verify the integrity of the atomic from the suggestions dropdown
    await getEditor(driver)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await upKey(actions)
    await rightKey(actions)
    await enterKey(actions)

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

    await doneButton.click()
    await isSaved(driver)
    await sleep(1000)

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
          <text>dummy text</text>
        </block>
        <block type="SOURCE">
          <text>test [this] second \ source</text>
        </block>
        <block type="ENTRY">
          <text>this is more dummy text</text>
        </block>
        <block type="SOURCE">
          <text>this is a test</text>
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
    await sendKeys(actions, 'this is an entry with ')
    await toggleBold(actions)
    await sendKeys(actions, 'bold')
    await toggleBold(actions)
    await enterKey(actions)
    await sendKeys(actions, 'still within the same block')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this should toggle a source block')
    await enterKey(actions)
    await upKey(actions)
    await enterKey(actions)
    await upKey(actions)
    await sendKeys(actions, '#this should toggle a topics block')
    await enterKey(actions)
    await sendKeys(actions, 'this entry is within two atomics')
    await enterKey(actions)
    await enterKey(actions)
    await backspaceKey(actions)
    await sendKeys(actions, ' appended text')
    await enterKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'second middle entry')
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
    await sendKeys(actions, 'last entry')
    await isSaved(driver)

    // refresh page
    await driver.navigate().refresh()
    await getEditor(driver)

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>this is an entry with </text>
          <text bold>bold</text>
          <text>{'\n'}still within the same block</text>
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
