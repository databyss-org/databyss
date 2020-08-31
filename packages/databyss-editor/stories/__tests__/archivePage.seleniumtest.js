/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import { getElementByTag, sleep, sendKeys, enterKey } from './_helpers.selenium'

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

    await sleep(1000)

    actions = driver.actions()

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
    await driver.navigate().refresh()
    await sleep(2000)

    // check sidebar list for archived page

    let archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()

    const archiveButton = await getElementByTag(
      driver,
      '[data-test-block-menu="archive"]'
    )
    await archiveButton.click()

    await sleep(2000)

    const pagesSidebarList = await getElementByTag(
      driver,
      '[data-test-element="sidebar-pages-list"]'
    )

    const _sidebarList = await pagesSidebarList.getText()

    // make sure second page does not appear on the sidebar
    assert.equal(_sidebarList, 'this is the first page title')

    // assure archive dropdown is not visible if one page exists
    let isElementVisible = true

    archiveDropdown = await getElementByTag(
      driver,
      '[data-test-element="archive-dropdown"]'
    )
    await archiveDropdown.click()
    try {
      await getElementByTag(driver, '[data-test-block-menu="archive"]')
    } catch (err) {
      isElementVisible = false
    }

    assert.equal(isElementVisible, false)
  })
})
