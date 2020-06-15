/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  getElementByTag,
  sleep,
  getElementById,
  enterKey,
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

describe('github bug fixes', () => {
  beforeEach(async done => {
    // https://wiki.saucelabs.com/display/DOCS/Custom+Sauce+Labs+WebDriver+Extensions+for+Network+and+Log+Commands
    // Offline scripts only available in chrome
    driver = await startSession('Slate 5 - fixes', OSX, CHROME)
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

  it('should fix 257', async () => {
    await sleep(300)
    await editor.sendKeys('This should test for')
    // await actions.sendKeys('this is an entry with ')
    // await toggleBold(actions)
    // await actions.sendKeys('bold')

    // await toggleBold(actions)

    // await enterKey(actions)

    // toggle offline
    if (!process.env.LOCAL_ENV) {
      await driver.executeScript('sauce:throttleNetwork', {
        condition: 'offline',
      })
    }
    await editor.sendKeys(' offline capabilities')

    await enterKey(actions)
    await enterKey(actions)

    await editor.sendKeys('second entry block')

    await enterKey(actions)
    await enterKey(actions)

    await editor.sendKeys('third entry block')

    //   toggle online
    if (!process.env.LOCAL_ENV) {
      await driver.executeScript('sauce:throttleNetwork', {
        condition: 'online',
      })
    }

    await sleep(10000)

    // refresh page
    await driver.navigate().refresh()

    slateDocument = await getElementById(driver, 'slateDocument')

    const actual = JSON.parse(await slateDocument.getText())

    const expected = (
      <editor>
        <block type="ENTRY">
          <text>This should test for offline capabilities</text>
        </block>
        <block type="ENTRY">
          <text>second entry block</text>
        </block>
        <block type="ENTRY">
          <text>
            third entry block<cursor />
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
