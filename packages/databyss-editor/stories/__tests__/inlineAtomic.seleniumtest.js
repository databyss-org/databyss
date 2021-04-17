/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  getElementsByTag,
  sleep,
  sendKeys,
  enterKey,
  downKey,
  leftKey,
  backspaceKey,
  getEditor,
  isAppInNotesSaved,
  downShiftKey,
  rightKey,
  logout,
  tagButtonClick,
  tagButtonListClick,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://localhost:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('inline atomic', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    // OSX and chrome are necessary
    driver = await startSession({ platformName: OSX, browserName: CHROME })
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    const emailField = await getElementByTag(driver, '[data-test-path="email"]')
    await emailField.sendKeys(`${random}@test.com`)

    await tagButtonClick('data-test-id="continueButton"', driver)

    const codeField = await getElementByTag(driver, '[data-test-path="code"]')
    await codeField.sendKeys('test-code-42')

    await tagButtonClick('data-test-id="continueButton"', driver)

    await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async (done) => {
    await logout(driver)
    await driver.quit()

    done()
  })

  it('should test the integrity of inline atomics', async () => {
    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    // populate a page
    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(500)
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)

    await sendKeys(actions, 'this will contain a new #test')
    await enterKey(actions)
    await sendKeys(actions, ' text')

    await isAppInNotesSaved(driver)

    // assure the new topic is in the sidebar

    let sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    assert.equal(sidebarTopics.length, 1)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this entry should get ignored')

    await tagButtonClick('data-test-element="new-page-button"', driver)

    // populate a new page with the same topic
    await getEditor(driver)

    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'this is the second page title')
    await enterKey(actions)
    await sendKeys(actions, '#test')
    await sleep(1000)
    await downKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this entry will be tagged under topic')
    await enterKey(actions)
    await enterKey(actions)

    await sendKeys(actions, '/#')
    await sleep(1000)
    await isAppInNotesSaved(driver)

    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await sleep(500)
    // verify both atomics are linked
    let topicResults = await await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
    )
    // check for that topic exists on page
    assert.equal(topicResults.length, 2)

    let topicEntries = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
    )

    // assure two results are listed under entry
    assert.equal(topicEntries.length, 2)

    // change the name of the inline atomic
    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      1,
      driver
    )
    await leftKey(actions)
    await leftKey(actions)

    await leftKey(actions)
    await enterKey(actions)

    const textInput = await getElementByTag(driver, '[data-test-path="text"]')
    await textInput.click()

    // await selectAll(actions)
    await backspaceKey(actions)
    await backspaceKey(actions)
    await backspaceKey(actions)
    await backspaceKey(actions)
    await backspaceKey(actions)

    await sendKeys(actions, 'new topic')

    await tagButtonClick('data-test-dismiss-modal="true"', driver)

    await tagButtonClick('data-test-element="search-input"', driver)

    await sleep(500)
    await sendKeys(actions, 'new topic')
    await sleep(1000)
    await enterKey(actions)
    await sleep(1000)

    // verify results still appear

    topicResults = await await getElementsByTag(
      driver,
      '[data-test-element="search-result-page"]'
    )
    // check for that topic exists on page
    assert.equal(topicResults.length, 2)

    topicEntries = await getElementsByTag(
      driver,
      '[data-test-element="search-result-entries"]'
    )

    // assure two results are listed under entry
    assert.equal(topicEntries.length, 2)

    // change the name of the inline atomic
    await tagButtonListClick(
      'data-test-element="search-result-entries"',
      0,
      driver
    )

    await getEditor(driver)
    // highlight row and get inner selection
    await downShiftKey(actions)
    const _selection = await driver.executeScript(
      'return window.getSelection().toString()'
    )
    // check highlight for correct words
    assert.equal(_selection.trim(), 'this will contain a new #new topic text')
    // remove the inline topic and it should be removed from search results
    await rightKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)
    await leftKey(actions)

    await backspaceKey(actions)
    await sleep(1000)
    await isAppInNotesSaved(driver)

    // check the sidebar for topic and see results
    // only one result should be present
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)

    topicResults = await await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
    )
    // check for that topic exists on page
    assert.equal(topicResults.length, 1)

    topicEntries = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
    )

    // assure two results are listed under entry
    assert.equal(topicEntries.length, 1)
    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      0,
      driver
    )

    await getEditor(driver)
    await driver.navigate().refresh()
    await sleep(1000)

    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(1000)
    await enterKey(actions)
    await rightKey(actions)
    await rightKey(actions)

    await backspaceKey(actions)
    await backspaceKey(actions)
    await sleep(1000)
    // check sidebar for removed topic
    await isAppInNotesSaved(driver)

    sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )
    assert.equal(sidebarTopics.length, 0)
  })
})
