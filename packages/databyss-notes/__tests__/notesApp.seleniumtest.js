/* eslint-disable func-names */
import assert from 'assert'
import innerText from 'innertext'
import { startSession, OSX, CHROME } from '@databyss-org/ui/lib/saucelabs'
import {
  getEditor,
  getElementByTag,
  getElementsByTag,
  sleep,
  isAppInNotesSaved,
  sendKeys,
  enterKey,
  backspaceKey,
  tagButtonClick,
  tagButtonListClick,
  getEditorElements,
  login,
  tryQuit,
} from './util.selenium'

let driver
let actions

describe('notes app', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: OSX, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    await sleep(500)
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
  })

  it('should switch page names and verify atomics appear on the sidebar', async () => {
    // click on topics sidebar
    await tagButtonClick('data-test-sidebar-element="topics"', driver)

    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'First Test Page Title')
    await enterKey(actions)

    await sendKeys(actions, '#this is a new topic')
    await enterKey(actions)
    await sendKeys(actions, 'entries included within the topic')
    await isAppInNotesSaved(driver)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'more entries included within topic')
    await isAppInNotesSaved(driver)

    // verify that the topic sidebar has the new topic

    const sidebarTopic = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    const sidebar = await sidebarTopic[0].getAttribute('innerText')

    assert.equal(sidebar.trim(), 'this is a new topic')

    // click on the topic in sidebar
    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await sleep(1000)

    // get all search page results
    await tagButtonListClick('data-test-element="atomic-results"', 0, driver)

    await getEditor(driver)

    // add second page
    await tagButtonClick('data-test-element="new-page-button"', driver)

    // wait for editor to be visible
    await getEditor(driver)

    await tagButtonClick('data-test-sidebar-element="sources"', driver)

    await tagButtonClick('data-test-element="page-header"', driver)

    await sendKeys(actions, 'Second page title')
    await enterKey(actions)

    // select author from the google api
    await sendKeys(actions, '@Murray Bookchin')
    await isAppInNotesSaved(driver)

    await tagButtonClick('data-test-block-menu="GOOGLE_BOOKS"', driver)

    await tagButtonListClick('data-test-catalog="GOOGLE_BOOKS"', 0, driver)

    await isAppInNotesSaved(driver)
    await sleep(3000)

    // check if source is on sidebar
    let sidebarSource = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    sidebarSource = await sidebarSource[1].getAttribute('innerText')

    // verify source added to sidebar
    assert.equal(sidebarSource.trim().length > 0, true)
    // delete the source and verify its removed from the sidebar
    await backspaceKey(actions)
    await backspaceKey(actions)
    await sleep(3000)

    // check if the source exists in the sidebar, it should be removed

    sidebarSource = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    assert.equal(sidebarSource.length, 1)

    await sendKeys(actions, 'Editor test two')

    // click on sidebar for pages menu
    await tagButtonClick('data-test-sidebar-element="pages"', driver)

    await sleep(500)

    await tagButtonListClick('data-test-element="page-sidebar-item"', 0, driver)

    await getEditor(driver)

    let headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('outerHTML')

    assert.equal(innerText(headerField), 'First Test Page Title')

    // Second page integrity test
    await tagButtonListClick('data-test-element="page-sidebar-item"', 1, driver)

    headerField = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )

    headerField = await headerField.getAttribute('outerHTML')

    const editorElements = await getEditorElements(driver)

    assert.equal(innerText(headerField), 'Second page title')
    assert.equal(
      innerText(await editorElements[1].getAttribute('outerHTML')),
      'Editor test two'
    )
  })
})
