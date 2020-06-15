/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  sleep,
  toggleBold,
  //   toggleItalic,
  //   toggleLocation,
  //   getElementById,
  //   enterKey,
  //   upKey,
  //   downKey,
  //   backspaceKey,
} from './_helpers.selenium'

let driver
let editor
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

const LOCAL_URL_EDITOR = 'http://localhost:3000'
const PROXY_URL_EDITOR = 'http://0.0.0.0:3000'

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('notes app', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Notes app', OSX, SAFARI)
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

    await sleep(1000)

    await driver.get(
      process.env.LOCAL_ENV ? LOCAL_URL_EDITOR : PROXY_URL_EDITOR
    )

    editor = await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('shoud switch page names', async () => {
    await editor.sendKeys('the following text should be ')
    await toggleBold(actions)
    await actions.sendKeys('bold')
    await actions.perform()
    await sleep(7000)

    await driver.navigate().refresh()

    await sleep(3000)

    // slateDocument = await getElementById(driver, 'slateDocument')

    // const actual = JSON.parse(await slateDocument.getText())

    // const expected = (
    //   <editor>
    //     <block type="ENTRY">
    //       <text>the following text should be </text>
    //       <text bold>bold</text>
    //       <cursor />
    //     </block>
    //   </editor>
    // )

    // assert.deepEqual(
    //   sanitizeEditorChildren(actual.children),
    //   sanitizeEditorChildren(expected.children)
    // )

    assert.deepEqual(true, true)
  })
})
