/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'

import { startSession, CHROME } from '@databyss-org/ui/lib/saucelabs'

import {
  enterKey,
  getEditor,
  getElementByTag,
  isSaved,
  rightKey,
  sendKeys,
  sleep,
  tabKey,
  upKey,
} from './_helpers.selenium'

let driver
let editor
let actions

const LOCAL_URL = 'http://localhost:6006/iframe.html?id=services-auth--login'
const PROXY_URL = 'http://localhost:8080/iframe.html?id=services-auth--login'

const LOCAL_URL_EDITOR =
  'http://localhost:6006/iframe.html?id=services-page--slate-5'
const PROXY_URL_EDITOR =
  'http://localhost:8080/iframe.html?id=services-page--slate-5'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('<EditSourceForm/>', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)

    // osx and safari are necessary
    driver = await startSession({ browserName: CHROME })
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    await sleep(1000)

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
    await driver.quit()
  })

  it('should be able to change source title', async () => {
    const sourceTitle = 'some source title'

    await sleep(300)

    // write to editor
    await sendKeys(actions, `@${sourceTitle}`)
    await enterKey(actions)
    await isSaved(driver)

    await sleep(1000)

    // select newly created source block
    await upKey(actions)
    await upKey(actions)
    await rightKey(actions)

    // open modal
    await enterKey(actions)

    // FIXME: focus should be set to modal component on open

    // HACK: select element to be able to start keyboard navigation
    const nameField = await getElementByTag(driver, '[data-test-path="text"]')
    await nameField.click()

    // reach publication title field
    await tabKey(actions)

    // enter values to test later
    await sendKeys(actions, sourceTitle)

    // dismiss modal
    const dismissModalButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await dismissModalButton.click()

    await isSaved(driver)

    // refresh page
    await driver.navigate().refresh()

    // navigate into first source and verify the integrity of the atomic from the suggestions dropdown
    await getEditor(driver)

    // select source block anew
    await upKey(actions)
    await rightKey(actions)

    // open modal
    await enterKey(actions)

    // ensure source title is what has been entered previously
    const titleLabeledInput = await getElementByTag(
      driver,
      '[data-test-id="edfTitle"]'
    )
    const titleValue = await titleLabeledInput.getText()
    assert.equal(titleValue, sourceTitle)
  })
})
