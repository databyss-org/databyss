/* eslint-disable func-names */
import { Key, By } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  sleep,
  sendKeys,
  enterKey,
  getEditor,
  isAppInNotesSaved,
} from './_helpers.selenium'

let driver
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

    // wait for editor to be visible
    await getEditor(driver)
    actions = driver.actions()

    done()
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('should archive a page and remove the page from the sidebar', async () => {
    // populate a page
    const pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a test source')
    await enterKey(actions)
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
    await sendKeys(actions, 'this is the second entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is another test source')
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    // refresh and archive the page
    await driver.navigate().refresh()

    // check sidebar list for archived page

    let archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()

    let archiveButton = await getElementByTag(
      driver,
      '[data-test-block-menu="archive"]'
    )
    await archiveButton.click()

    let pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )
    let _sidebarList = await pagesSidebarList.getText()

    // make sure second page does not appear on the sidebar
    assert.equal(_sidebarList, 'this is the first page title')

    // assure archive dropdown is not visible if one page exists
    // let isElementVisible = true

    // archiveDropdown = await getElementByTag(
    //   driver,
    //   '[data-test-element="archive-dropdown"]'
    // )
    // await archiveDropdown.click()
    // try {
    //   await getElementByTag(driver, '[data-test-block-menu="archive"]')
    // } catch (err) {
    //   isElementVisible = false
    // }

    // assert.equal(isElementVisible, false)

    // click on archive sidebar
    const archiveSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="archive"]'
    )
    await archiveSidebarButton.click()

    pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )

    _sidebarList = await pagesSidebarList.getText()
    assert.equal(_sidebarList, 'this is the second page title')

    let archivedPageButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )
    await archivedPageButton.click()

    archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()

    // restore the page
    const restoreButton = await getElementByTag(
      driver,
      '[data-test-block-menu="restore"]'
    )
    await restoreButton.click()

    await getEditor(driver)

    // should redirect to the pages sidebar

    pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )

    _sidebarList = await pagesSidebarList.getText()

    _sidebarList.replace('\n', '')
    // sidebar should contain both pages
    assert.equal(
      _sidebarList,
      'this is the first page titlethis is the second page title'
    )

    // archive the first page
    const firstPageSidebarButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )

    await firstPageSidebarButton.click()
    await getEditor(driver)

    archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()

    archiveButton = await getElementByTag(
      driver,
      '[data-test-block-menu="archive"]'
    )
    await archiveButton.click()
    await getEditor(driver)

    // search for an atomic found in the archived page
    const searchSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="search"]'
    )

    await searchSidebarButton.click()

    let searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()
    await sendKeys(actions, 'source')
    await enterKey(actions)

    // get the search results in list format
    let searchPageResultsTitle = await driver.findElements(
      By.tagName('[data-test-element="search-results"]')
    )

    // searching for 'source' should only result in one source, archived source should not appear
    assert.equal(searchPageResultsTitle.length, 1)

    // clear search results
    const clearInput = await getElementByTag(
      driver,
      '[data-test-element="clear-search-results"]'
    )

    await clearInput.click()
    // test the word 'entry'
    // it should only have one search result

    searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()
    await sendKeys(actions, 'entry')
    await enterKey(actions)
    searchPageResultsTitle = await driver.findElements(
      By.tagName('[data-test-element="search-result-page"]')
    )

    // check the length of search results
    assert.equal(searchPageResultsTitle.length, 1)

    archiveButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="archive"]'
    )

    await archiveButton.click()

    archivedPageButton = await getElementByTag(
      driver,
      '[data-test-element="page-sidebar-0"]'
    )
    await archivedPageButton.click()

    archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()

    const deleteButton = await getElementByTag(
      driver,
      '[data-test-block-menu="delete"]'
    )
    await deleteButton.click()

    // verify only one page exists
    await getEditor(driver)
    pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )

    _sidebarList = await pagesSidebarList.getText()
    assert.equal(_sidebarList, 'this is the second page title')
    await archiveButton.click()
    // verify no pages are in archive bin
    pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )

    _sidebarList = await pagesSidebarList.getText()
    assert.equal(_sidebarList, '')

    newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    await newPageButton.click()
    // wait for editor to be visible
    await getEditor(driver)

    await enterKey(actions)

    await enterKey(actions)
    await sendKeys(actions, '@this')

    const suggestedSources = await driver.findElements(
      By.tagName('[data-test-element="suggested-menu-sources"')
    )

    // check that the editor only shows one suggestion, the deleted page should not be shown
    assert.equal(suggestedSources.length, 1)
  })
})
