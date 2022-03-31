/* eslint-disable func-names */
import assert from 'assert'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getElementByTag,
  isAppInNotesSaved,
  sleep,
  sendKeys,
  enterKey,
  upKey,
  downKey,
  logout,
  tagButtonClick,
  login,
  tryQuit,
} from './util.selenium'

let driver
// let editor
let actions

describe('editor sticky header', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: OSX, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    done()
  })

  afterEach(async (done) => {
    await logout(driver)
    await tryQuit(driver)
    done()
  })

  it('should render correct editor path for cursor', async () => {
    await tagButtonClick('data-test-element="page-header"', driver)

    await sleep(500)
    await sendKeys(actions, 'this is a page title')
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '@this is a test source')
    await enterKey(actions)
    await sendKeys(actions, 'this is another test entry')
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this is a test entry')
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'entry')
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '#this is a topic')
    await enterKey(actions)
    await isAppInNotesSaved(driver)
    await sendKeys(actions, 'this is a test entry')
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await sendKeys(actions, 'last entry')
    await isAppInNotesSaved(driver)

    // get page path
    let headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )

    headerSticky = await headerSticky.getAttribute('innerText')

    assert.equal(headerSticky, 'this is a page title / @ this is a test source')

    await upKey(actions)
    await upKey(actions)
    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(
      headerSticky,
      'this is a page title / @ this is a test source / # this is a topic'
    )

    await upKey(actions)
    await upKey(actions)
    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title / @ this is a test source')

    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/@')
    await downKey(actions)
    await isAppInNotesSaved(driver)

    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title / # this is a topic')

    await downKey(actions)

    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, '/#')
    await isAppInNotesSaved(driver)

    headerSticky = await getElementByTag(
      driver,
      '[data-test-element="editor-sticky-header"]'
    )
    headerSticky = await headerSticky.getAttribute('innerText')
    assert.equal(headerSticky, 'this is a page title')
    await isAppInNotesSaved(driver)
  })
})
