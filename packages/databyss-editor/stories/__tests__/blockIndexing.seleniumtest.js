/* eslint-disable func-names */
import { Key, By } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  sleep,
  sendKeys,
  enterKey,
  rightShiftKey,
  upKey,
  rightKey,
  tabKey,
  downKey,
  leftKey,
  backspaceKey,
  getEditor,
  isAppInNotesSaved,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('block indexing', () => {
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

    await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  // Tests for indexing [adding a topic, adds it to the index, clicking on it should show results, clicking on results should show page with correct entries]
  // Check for indexing closure accuracy [delete an atomic, it should remove all entries from that atomic; if you add an end atomic, it should only show entries up until that end atomic; if you delete an end atomic, it should carry on until there's another atomic] 5) Click on all authors brings up all authors, clicking on all sources brings up all sources, clicking on all topics brings up all topics 6) Clicking on an author in all authors, should bring you to that author's entry result page (same for all sources, and all topics)

  it('should test block indexing', async () => {
    // populate a page
    const pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)

    await sendKeys(actions, '@this is an opening source')
    await enterKey(actions)
    await upKey(actions)
    // edits the author
    await rightKey(actions)
    await rightKey(actions)
    await enterKey(actions)
    await sleep(1000)
    const name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    await rightKey(actions)
    await tabKey(actions)
    await sendKeys(actions, 'author citation')
    await tabKey(actions)
    await sendKeys(actions, 'Jaques')
    await tabKey(actions)
    await sendKeys(actions, 'Derrida')
    await tabKey(actions)
    await tabKey(actions)

    const doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()
    await sleep(500)
    await downKey(actions)
    await sendKeys(actions, 'this is an entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#a topic')
    await enterKey(actions)
    await sendKeys(actions, 'second entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'third entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await enterKey(actions)
    await sendKeys(actions, 'fourth entry not in atomic')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/@')
    await enterKey(actions)
    await sendKeys(actions, '#this is the second topic')
    await enterKey(actions)
    await sendKeys(actions, 'entry should be contained within topic')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'second entry within topic')
    await isAppInNotesSaved(driver)
    await sleep(1000)
    await driver.navigate().refresh()
    await getEditor(driver)
    const topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()

    // assure two topics are show in sidebar
    const secondTopic = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-2"]'
    )

    await secondTopic.click()
    await sleep(1000)

    const topicResults = await driver.findElements(
      By.tagName('[data-test-element="atomic-results"]')
    )
    // check for that topic exists on page
    assert.equal(topicResults.length, 1)

    const topicEntries = await driver.findElements(
      By.tagName('[data-test-element="atomic-result-item"]')
    )

    // assure two results are listed under entry
    assert.equal(topicEntries.length, 2)

    await topicEntries[1].click()
    await getEditor(driver)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)

    // get highlighted text
    const _selection = await driver.executeScript(
      'return window.getSelection().toString()'
    )
    // check highlight for correct words
    assert.equal(_selection, 'second')

    const sourcesSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="sources"]'
    )
    await sourcesSidebarButton.click()

    // assure two topics are show in sidebar
    const authorSidebarButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-2"]'
    )

    await authorSidebarButton.click()
    let authorSorces = await driver.findElements(
      By.tagName('[data-test-element="source-results"]')
    )

    await authorSorces[0].click()
    await sleep(1000)

    //  data-test-element="source-results"
    const citationsResults = await driver.findElements(
      By.tagName('[data-test-element="atomic-result-item"]')
    )

    assert.equal(citationsResults.length, 4)

    // remove author from page
    await citationsResults[0].click()
    await getEditor(driver)
    await leftKey(actions)
    await backspaceKey(actions)
    await isAppInNotesSaved(driver)

    const allSources = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )

    await allSources.click()

    authorSorces = await driver.findElements(
      By.tagName('[data-test-element="source-results"]')
    )

    await authorSorces[0].click()

    // check for no results
    const _results = await driver.findElements(
      By.tagName('[data-test-element="atomic-results"]')
    )

    // assure no results appear under author
    assert.equal(_results.length, 0)
  })
})
