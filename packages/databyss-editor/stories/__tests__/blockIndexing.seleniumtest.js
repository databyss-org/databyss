/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, CHROME, WIN } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  getElementsByTag,
  sleep,
  sendKeys,
  enterKey,
  rightShiftKey,
  upKey,
  rightKey,
  downKey,
  leftKey,
  backspaceKey,
  getEditor,
  isAppInNotesSaved,
  logout,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://localhost:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('block indexing', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    // WIN and SAFARI are necessary
    driver = await startSession({ platformName: WIN, browserName: CHROME })
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

  afterEach(async (done) => {
    await logout(driver)
    done()
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
    await isAppInNotesSaved(driver)

    await upKey(actions)
    // edits the author
    await rightKey(actions)
    await rightKey(actions)
    await enterKey(actions)
    await sleep(1000)
    const name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    await rightKey(actions)

    const addAuthorButton = await getElementByTag(
      driver,
      '[data-test-button="source-add-author"]'
    )

    await addAuthorButton.click()

    const lastName = await getElementByTag(
      driver,
      '[data-test-path="detail.authors[0].lastName"]'
    )
    await lastName.click()
    await sendKeys(actions, 'Derrida')

    const firstName = await getElementByTag(
      driver,
      '[data-test-path="detail.authors[0].firstName"]'
    )
    await firstName.click()
    await sendKeys(actions, 'Jaques')

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
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await enterKey(actions)
    await sendKeys(actions, 'fourth entry not in atomic')
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/@')
    await enterKey(actions)
    await sendKeys(actions, '#this is the second topic')
    await enterKey(actions)
    await sendKeys(actions, 'entry should be contained within topic')
    await isAppInNotesSaved(driver)

    await enterKey(actions)
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    await sendKeys(actions, 'second entry within topic')
    // BLOCK RELATIONS NEED TO BE ADDED, WAIT FOR CHANGE
    await sleep(3000)
    await isAppInNotesSaved(driver)
    await sleep(3000)

    await driver.navigate().refresh()
    await getEditor(driver)
    const topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()

    await sleep(2000)

    // TODO: function should wait until element is located then remove sleep
    // assure two topics are show in sidebar
    const secondTopic = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await secondTopic[1].click()
    await sleep(1000)

    const topicResults = await await getElementsByTag(
      driver,
      '[data-test-element="atomic-results"]'
    )
    // check for that topic exists on page
    assert.equal(topicResults.length, 1)

    const topicEntries = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
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
    await sleep(1000)

    // assure two topics are show in sidebar
    const authorSidebarButton = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await authorSidebarButton[1].click()
    await sleep(1000)
    const authorSorces = await getElementsByTag(
      driver,
      '[data-test-element="source-results"]'
    )

    await authorSorces[0].click()
    await sleep(1000)

    const citationsResults = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
    )

    assert.equal(citationsResults.length, 4)

    // remove author from page
    await citationsResults[0].click()
    await getEditor(driver)
    await leftKey(actions)

    await backspaceKey(actions)
    await sleep(3000)
    await isAppInNotesSaved(driver)

    const allSources = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    // author should not appear on sidebar
    assert.equal(allSources.length, 1)
  })
})
