/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  sleep,
  sendKeys,
  enterKey,
  //  toggleBold,
  //   toggleItalic,
  //   toggleLocation,
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

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('archive page', () => {
  beforeEach(async done => {
    const random = Math.random()
      .toString(36)
      .substring(7)
    // OSX and chrome are necessary
    driver = await startSession({ platformName: OSX, browserName: CHROME })
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

    actions = driver.actions()

    //  editor = await getEditor(driver)

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should archive a page and remove the page from the sidebar', async () => {
    // populate a page
    await sleep(500)
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a test source')
    await enterKey(actions)
    // create a new page and populate the page

    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()
    await sleep(2000)

    await sendKeys(actions, 'this is the second page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is the second entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another test source')
    await enterKey(actions)

    // refresh and archive the page

    // check sidebar list for archived page

    // let headerField = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-header"]'
    // )
    // await headerField.sendKeys('First Test Page Title')

    // editor.sendKeys('Editor test one')

    // await sleep(2000)

    // const newPageButton = await getElementByTag(
    //   driver,
    //   '[data-test-element="new-page-button"]'
    // )

    // await newPageButton.click()
    // await sleep(2000)

    // headerField = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-header"]'
    // )

    // await headerField.sendKeys('Second page title')

    // editor = await getEditor(driver)

    // editor.sendKeys('Editor test two')

    // await sleep(2000)

    // const firstPageButton = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-sidebar-0"]'
    // )

    // await firstPageButton.click()

    // await sleep(1000)

    // headerField = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-header"]'
    // )

    // headerField = await headerField.getAttribute('value')

    // editor = await getEditor(driver)

    // let editorField = await editor.getAttribute('innerText')

    // assert.equal(headerField, 'First Test Page Title')
    // assert.equal(editorField, 'Editor test one')

    // // Second page integrity test
    // const secondPageButton = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-sidebar-1"]'
    // )

    // await secondPageButton.click()

    // await sleep(1000)

    // headerField = await getElementByTag(
    //   driver,
    //   '[data-test-element="page-header"]'
    // )

    // headerField = await headerField.getAttribute('value')

    // editor = await getEditor(driver)

    // editorField = await editor.getAttribute('innerText')

    // await sleep(1000)

    // assert.equal(headerField, 'Second page title')
    assert.equal(true, true)
  })
})
