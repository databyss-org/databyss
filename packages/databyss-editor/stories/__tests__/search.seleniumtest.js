/* eslint-disable func-names */
import { Key, By } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  isAppInNotesSaved,
  getElementByTag,
  sendKeys,
  enterKey,
  rightShiftKey,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('entry search', () => {
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

    // wait for editor to be visible
    await getEditor(driver)

    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  // should search an entry at the middle of an entry
  // should search an entry at the end of an entry
  it('should test the integrity of search results', async () => {
    // populate a page
    const pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a test source')
    await enterKey(actions)
    await sendKeys(
      actions,
      'something keyword appears at the start of an entry'
    )
    // create a new page and populate the page
    let newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )
    await newPageButton.click()
    // wait for editor to be visible
    await getEditor(driver)
    await sendKeys(actions, 'this is the second page title')
    await enterKey(actions)
    await sendKeys(
      actions,
      'keyword something appears in the middle of an entry'
    )
    await enterKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another test source')
    await enterKey(actions)
    // create a third page
    newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )
    await newPageButton.click()
    // wait for editor to be visible
    await getEditor(driver)
    await sendKeys(actions, 'this is the third page title')
    await enterKey(actions)
    await sendKeys(actions, '@this is another test source')
    await enterKey(actions)
    await sendKeys(actions, 'keyword appears at the end of an entry something')
    await enterKey(actions)
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // refresh and archive the page
    await driver.navigate().refresh()
    // click on sidebar entry search
    const searchSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="search"]'
    )
    await searchSidebarButton.click()
    // click on sidebar entry search
    const searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()
    // wait for editor to be visible
    await getEditor(driver)
    await sendKeys(actions, 'something')
    await enterKey(actions)

    // results can be in random order
    const searchPageResultsTitle = await driver.findElements(
      By.tagName('[data-test-element="search-result-page"]')
    )
    // check the length of
    assert.equal(searchPageResultsTitle.length, 3)
    // should verify correct pages appear on search results
    // a combination of all three page headers
    const pageHeaders =
      'this is the third page title this is the second page title this is the first page title'
    const firstPageTitle = await searchPageResultsTitle[0].getAttribute(
      'innerText'
    )
    const secondPageTitle = await searchPageResultsTitle[1].getAttribute(
      'innerText'
    )
    const thirdPageTitle = await searchPageResultsTitle[2].getAttribute(
      'innerText'
    )
    // check first title
    assert.equal(pageHeaders.includes(firstPageTitle.trim()), true)
    // check second title
    assert.equal(pageHeaders.includes(secondPageTitle.trim()), true)
    // check third title
    assert.equal(pageHeaders.includes(thirdPageTitle.trim()), true)

    // it should click on the first result and verify anchor hyperlink works
    // results can be in random order
    const entrySearchResult = await driver.findElements(
      By.tagName('[data-test-element="search-result-entries"]')
    )

    const titleArray = [
      firstPageTitle.trim(),
      secondPageTitle.trim(),
      thirdPageTitle.trim(),
    ]
    const _idx = titleArray.findIndex(t => t === 'this is the third page title')

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
