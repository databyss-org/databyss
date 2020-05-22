/** @jsx h */
/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
// import { jsx as h } from './hyperscript'
// import { sanitizeEditorChildren } from './__helpers'
import { getEditor, getElementByTag, sleep } from './_helpers.selenium'

let driver
let editor
// let slateDocument
let emailButton
// let emailTextField
let actions
const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://0.0.0.0:8080/iframe.html?id=services-auth--login'

const random = Math.random()
  .toString(36)
  .substring(7)

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('connected editor', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-database-connector', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    // LOGIN FLOW
    emailButton = await getElementByTag(driver, '[data-test-id="emailButton"]')
    await emailButton.click()

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
      'http://localhost:6006/iframe.html?id=services-page--slate-5'
    )

    editor = await getEditor(driver)

    // TODO: add slate document to page
    // TODO: add autosave to story

    // slateDocument = await driver.findElement(By.id('slateDocument'))
    await editor.click()
    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should login using email', async () => {
    await sleep(300)
    await actions.sendKeys('test')
    await actions.perform()

    assert.deepEqual(true, true)
  })
})
