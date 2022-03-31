/* eslint-disable func-names */
import assert from 'assert'
import { startSession, CHROME, WIN } from '@databyss-org/ui/lib/saucelabs'
import {
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
  tagButtonClick,
  tagButtonListClick,
  tabKey,
  login,
} from './util.selenium'

let driver
let actions

describe('block indexing', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions
    done()
  })

  afterEach(async (done) => {
    await logout(driver)
    await driver.quit()
    done()
  })

  // Tests for indexing [adding a topic, adds it to the index, clicking on it should show results, clicking on results should show page with correct entries]
  // Check for indexing closure accuracy [delete an atomic, it should remove all entries from that atomic; if you add an end atomic, it should only show entries up until that end atomic; if you delete an end atomic, it should carry on until there's another atomic] 5) Click on all authors brings up all authors, clicking on all sources brings up all sources, clicking on all topics brings up all topics 6) Clicking on an author in all authors, should bring you to that author's entry result page (same for all sources, and all topics)

  it('should test block indexing', async () => {
    // populate a page
    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(500)
    await sendKeys(actions(), 'this is the first page title')
    await enterKey(actions())

    await sendKeys(actions(), '@this is an opening source')
    await enterKey(actions())
    await isAppInNotesSaved(driver)

    await upKey(actions())
    // edits the author
    await rightKey(actions())
    await rightKey(actions())
    await enterKey(actions())
    await sleep(1000)

    await tagButtonClick('data-test-button="open-source-modal"', driver)
    await sleep(1000)

    await tagButtonClick('data-test-path="text"', driver)

    await rightKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())
    await tabKey(actions())

    await tagButtonClick('data-test-button="source-add-author"', driver)

    await tagButtonClick('data-test-path="detail.authors[0].lastName"', driver)

    await sendKeys(actions(), 'Derrida')

    // await tagButtonClick('data-test-path="detail.authors[0].firstName"', driver)
    await tabKey(actions())

    await sendKeys(actions(), 'Jacques')

    await tagButtonClick('data-test-dismiss-modal="true"', driver)

    await sleep(500)

    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      0,
      driver
    )

    await sleep(1000)

    await downKey(actions())
    await sendKeys(actions(), 'this is an entry')
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), '#a topic')
    await enterKey(actions())
    await sendKeys(actions(), 'second entry')
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), 'third entry')
    await isAppInNotesSaved(driver)
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), '/#')
    await enterKey(actions())
    await sendKeys(actions(), 'fourth entry not in atomic')
    await isAppInNotesSaved(driver)
    await enterKey(actions())
    await enterKey(actions())
    await sendKeys(actions(), '/@')
    await enterKey(actions())
    await sendKeys(actions(), '#this is the second topic')
    await enterKey(actions())
    await sendKeys(actions(), 'entry should be contained within topic')
    await isAppInNotesSaved(driver)

    await enterKey(actions())
    await enterKey(actions())
    await isAppInNotesSaved(driver)

    await sendKeys(actions(), 'second entry within topic')
    // BLOCK RELATIONS NEED TO BE ADDED, WAIT FOR CHANGE
    await sleep(3000)
    await isAppInNotesSaved(driver)
    await sleep(3000)

    await driver.navigate().refresh()
    await getEditor(driver)

    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    await sleep(2000)

    // TODO: function should wait until element is located then remove sleep
    // assure two topics are show in sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)

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

    // assure 3 results are listed under entry (heading + 2 entries)
    assert.equal(topicEntries.length, 3)

    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      2,
      driver
    )

    await getEditor(driver)
    await rightShiftKey(actions())
    await rightShiftKey(actions())
    await rightShiftKey(actions())
    await rightShiftKey(actions())
    await rightShiftKey(actions())
    await rightShiftKey(actions())

    // get highlighted text
    const _selection = await driver.executeScript(
      'return window.getSelection().toString()'
    )
    // check highlight for correct words
    assert.equal(_selection, 'second')

    await tagButtonClick('data-test-sidebar-element="sources"', driver)

    await sleep(1000)

    // assure two topics are show in sidebar

    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)

    await sleep(1000)

    await tagButtonListClick('data-test-element="source-results"', 0, driver)

    await sleep(1000)

    const citationsResults = await getElementsByTag(
      driver,
      '[data-test-element="atomic-result-item"]'
    )

    assert.equal(citationsResults.length, 6)

    // remove author from page
    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      0,
      driver
    )

    await getEditor(driver)
    await leftKey(actions())
    await rightShiftKey(actions())
    await rightShiftKey(actions())
    await backspaceKey(actions())
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
