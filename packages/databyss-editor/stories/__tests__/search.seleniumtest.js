/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  isAppInNotesSaved,
  getElementByTag,
  getElementsByTag,
  sendKeys,
  enterKey,
  rightShiftKey,
  sleep,
  logout,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://localhost:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('entry search', () => {
  beforeEach(async (done) => {
    const random = Math.random().toString(36).substring(7)
    // OSX and chrome are necessary
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

    // wait for editor to be visible
    await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async (done) => {
    await logout(driver)
    done()
  })

  // should search an entry at the middle of an entry
  // should search an entry at the end of an entry
  it('should test the integrity of search results', async () => {
    // populate a page
    let pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sendKeys(actions, 'this is the first page title')
    await sleep(500)

    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this has keyword something in source')
    await enterKey(actions)
    await sendKeys(
      actions,
      'something keyword appears at the start of an entry'
    )
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this will also have keyword something')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this keyword something will be searched')
    await isAppInNotesSaved(driver)
    await sleep(1000)
    // check for search results appearing in the same order as they appear on the page
    let searchSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="search"]'
    )
    //  data-test-element="search-result-entries"

    await searchSidebarButton.click()
    // click on sidebar entry search
    let searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()
    // wait for editor to be visible
    await sleep(500)
    await sendKeys(actions, 'something searched will')
    await sleep(500)
    await enterKey(actions)

    // get the search results, they should be in the order of relevance
    const searchPageEntryResults = await getElementsByTag(
      driver,
      '[data-test-element="search-result-entries"]'
    )

    await sleep(6000)
    assert.equal(searchPageEntryResults.length, 3)

    // get text from entry search results
    const results = await Promise.all(
      searchPageEntryResults.map(async (r) => {
        const _text = await r.getAttribute('innerText')
        return _text.trim()
      })
    )
    assert.equal(results[0], 'this keyword something will be searched')

    assert.equal(results[1], 'this will also have keyword something')

    assert.equal(
      results[2],
      'something keyword appears at the start of an entry'
    )

    // clear the search element
    const clearButton = await getElementByTag(
      driver,
      '[data-test-element="clear-search-results"]'
    )
    await clearButton.click()

    // create a new page and populate the page
    let newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )
    await newPageButton.click()
    // wait for editor to be visible
    await getEditor(driver)
    pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is the second page title')
    await sleep(500)
    await enterKey(actions)
    await sendKeys(
      actions,
      'keyword something appears in the middle of an entry'
    )
    await enterKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '# this is a topic with something keyword')
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // create a third page
    newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )
    await newPageButton.click()
    // wait for editor to be visible
    await getEditor(driver)
    pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sendKeys(
      actions,
      'this is the third page title has keyword something'
    )
    await sleep(500)
    await enterKey(actions)
    await sendKeys(actions, '@this is another test source')
    await enterKey(actions)
    await sendKeys(actions, 'keyword appears at the end of an entry something')
    await enterKey(actions)
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // refresh and archive the page
    await driver.navigate().refresh()

    await getEditor(driver)

    // click on sidebar entry search
    searchSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="search"]'
    )
    await searchSidebarButton.click()
    // click on sidebar entry search
    searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()
    await sendKeys(actions, 'something')
    await sleep(1000)
    // await enterKey(actions)
    await enterKey(actions)

    // verify that a source is shown in the search results
    let sourceResult = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    sourceResult = await sourceResult[1].getAttribute('innerText')

    assert.equal(sourceResult.trim(), 'this has keyword something in source')

    const sidebarResults = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    const topicResult = await sidebarResults[2].getAttribute('innerText')
    assert.equal(topicResult.trim(), 'this is a topic with something keyword')

    const pageResult = await sidebarResults[3].getAttribute('innerText')
    assert.equal(
      pageResult.trim(),
      'this is the third page title has keyword something'
    )

    // results can be in random order
    const searchPageResultsTitle = await getElementsByTag(
      driver,
      '[data-test-element="search-result-page"]'
    )

    // check the length of
    assert.equal(searchPageResultsTitle.length, 3)
    // should verify correct pages appear on search results
    // a combination of all three page headers

    const pageTitleResults = await Promise.all(
      searchPageResultsTitle.map(async (r) => {
        const _text = await r.getAttribute('innerText')
        return _text.trim()
      })
    )

    // check first title
    assert.equal(
      pageTitleResults.includes('this is the first page title'),
      true
    )
    // check second title
    assert.equal(
      pageTitleResults.includes('this is the second page title'),
      true
    )
    // check third title
    assert.equal(
      pageTitleResults.includes(
        'this is the third page title has keyword something'
      ),
      true
    )

    // it should click on the first result and verify anchor hyperlink works
    // results can be in random order
    const entrySearchResult = await getElementsByTag(
      driver,
      '[data-test-element="search-result-entries"]'
    )

    const entrySearchResultArray = await Promise.all(
      entrySearchResult.map(async (r) => {
        const _text = await r.getAttribute('innerText')
        return _text.trim()
      })
    )

    const _idx = entrySearchResultArray.findIndex(
      (e) => e === 'keyword appears at the end of an entry something'
    )

    await entrySearchResult[_idx].click()
    // wait for editor to be visible
    await getEditor(driver)
    // highlights current anchor position
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    await rightShiftKey(actions)
    const _selection = await driver.executeScript(
      'return window.getSelection().toString()'
    )
    // check highlight for correct words
    assert.equal(_selection, 'keyword')
  })
})
