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
  selectAll,
  downShiftKey,
} from './_helpers.selenium'

let driver
let actions
const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('inline atomic', () => {
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

  it('test the integrity of inline atomics', async () => {
    let topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()
    // populate a page
    let pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()
    await sleep(500)
    await sendKeys(actions, 'this is the first page title')
    await enterKey(actions)

    await sendKeys(actions, 'this will contain a new #inline source')
    await enterKey(actions)
    await sendKeys(actions, ' with appended text')

    await isAppInNotesSaved(driver)

    // assure the new topic is in the sidebar
    let sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    assert.equal(sidebarTopics.length, 2)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this entry should get ignored')

    const newPageButton = await getElementByTag(
      driver,
      '[data-test-element="new-page-button"]'
    )

    // populate a new page with the same topic
    await newPageButton.click()
    await getEditor(driver)

    pageTitle = await getElementByTag(
      driver,
      '[data-test-element="page-header"]'
    )
    await pageTitle.click()

    await sendKeys(actions, 'this is the second page title')
    await enterKey(actions)
    await sendKeys(actions, '#inline source')
    await sleep(1000)
    await downKey(actions)
    await enterKey(actions)
    await enterKey(actions)
    await sendKeys(actions, 'this entry will be tagged under topic')
    await enterKey(actions)
    await enterKey(actions)

    await sendKeys(actions, '/#')
    await isAppInNotesSaved(driver)

    topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()

    sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )
    await sidebarTopics[1].click()

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
    await topicEntries[1].click()
    await leftKey(actions)
    await leftKey(actions)

    await leftKey(actions)
    await enterKey(actions)

    const textInput = await getElementByTag(driver, '[data-test-path="text"]')
    await textInput.click()

    // await selectAll(actions)
    // await backspaceKey(actions)
    await sendKeys(actions, ' with update')

    const doneButton = await getElementByTag(
      driver,
      '[data-test-dismiss-modal="true"]'
    )
    await doneButton.click()

    const searchInput = await getElementByTag(
      driver,
      '[data-test-element="search-input"]'
    )
    await searchInput.click()

    await sleep(500)
    await sendKeys(actions, 'inline source')
    await enterKey(actions)

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

    await topicEntries[0].click()
    await getEditor(driver)
    // highlight row and get inner selection
    await downShiftKey(actions)
    const _selection = await driver.executeScript(
      'return window.getSelection().toString()'
    )
    // check highlight for correct words
    assert.equal(
      _selection.trim(),
      'this will contain a new #inline source  with update with appended text'
    )

    await backspaceKey(actions)

    // check the sidebar for topic and see results
    // only one result should be present
    sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )

    await sidebarTopics[1].click()

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

    await topicEntries[0].click()

    await getEditor(driver)
    await driver.navigate().refresh()
    topicsSidebarButton = await getElementByTag(
      driver,
      '[data-test-sidebar-element="topics"]'
    )
    await topicsSidebarButton.click()
    await getEditor(driver)
    await leftKey(actions)
    await backspaceKey(actions)

    // check sidebar for removed topic
    await isAppInNotesSaved(driver)

    sidebarTopics = await getElementsByTag(
      driver,
      '[data-test-element="page-sidebar-item"]'
    )
    assert.equal(sidebarTopics.length, 1)
    // await upKey(actions)
    // // edits the author
    // await rightKey(actions)
    // await rightKey(actions)
    // await enterKey(actions)
    // await sleep(1000)
    // const name = await getElementByTag(driver, '[data-test-path="text"]')

    // await name.click()
    // await rightKey(actions)
    // await tabKey(actions)
    // await sendKeys(actions, 'author citation')
    // await tabKey(actions)
    // await sendKeys(actions, 'Jaques')
    // await tabKey(actions)
    // await sendKeys(actions, 'Derrida')
    // await tabKey(actions)
    // await tabKey(actions)

    // const doneButton = await getElementByTag(
    //   driver,
    //   '[data-test-dismiss-modal="true"]'
    // )
    // await doneButton.click()
    // await sleep(500)
    // await downKey(actions)
    // await sendKeys(actions, 'this is an entry')
    // await enterKey(actions)
    // await enterKey(actions)
    // await sendKeys(actions, '#a topic')
    // await enterKey(actions)
    // await sendKeys(actions, 'second entry')
    // await enterKey(actions)
    // await enterKey(actions)
    // await sendKeys(actions, 'third entry')
    // await enterKey(actions)
    // await enterKey(actions)
    // await sendKeys(actions, '/#')
    // await enterKey(actions)
    // await sendKeys(actions, 'fourth entry not in atomic')
    // await enterKey(actions)
    // await enterKey(actions)
    // await sendKeys(actions, '/@')
    // await enterKey(actions)
    // await sendKeys(actions, '#this is the second topic')
    // await enterKey(actions)
    // await sendKeys(actions, 'entry should be contained within topic')
    // await enterKey(actions)
    // await enterKey(actions)
    // await sendKeys(actions, 'second entry within topic')
    // await isAppInNotesSaved(driver)
    // await driver.navigate().refresh()
    // await getEditor(driver)
    // const topicsSidebarButton = await getElementByTag(
    //   driver,
    //   '[data-test-sidebar-element="topics"]'
    // )
    // await topicsSidebarButton.click()

    // await sleep(2000)

    // // assure two topics are show in sidebar
    // const secondTopic = await getElementsByTag(
    //   driver,
    //   '[data-test-element="page-sidebar-item"]'
    // )

    // await secondTopic[2].click()
    // await sleep(1000)

    // const topicResults = await await getElementsByTag(
    //   driver,
    //   '[data-test-element="atomic-results"]'
    // )
    // // check for that topic exists on page
    // assert.equal(topicResults.length, 1)

    // const topicEntries = await getElementsByTag(
    //   driver,
    //   '[data-test-element="atomic-result-item"]'
    // )

    // // assure two results are listed under entry
    // assert.equal(topicEntries.length, 2)

    // await topicEntries[1].click()
    // await getEditor(driver)
    // await rightShiftKey(actions)
    // await rightShiftKey(actions)
    // await rightShiftKey(actions)
    // await rightShiftKey(actions)
    // await rightShiftKey(actions)
    // await rightShiftKey(actions)

    // // get highlighted text
    // const _selection = await driver.executeScript(
    //   'return window.getSelection().toString()'
    // )
    // // check highlight for correct words
    // assert.equal(_selection, 'second')

    // const sourcesSidebarButton = await getElementByTag(
    //   driver,
    //   '[data-test-sidebar-element="sources"]'
    // )
    // await sourcesSidebarButton.click()
    // await sleep(1000)

    // // assure two topics are show in sidebar
    // const authorSidebarButton = await getElementsByTag(
    //   driver,
    //   '[data-test-element="page-sidebar-item"]'
    // )

    // await authorSidebarButton[2].click()
    // await sleep(1000)
    // const authorSorces = await getElementsByTag(
    //   driver,
    //   '[data-test-element="source-results"]'
    // )

    // await authorSorces[0].click()
    // await sleep(1000)

    // //  data-test-element="source-results"
    // const citationsResults = await getElementsByTag(
    //   driver,
    //   '[data-test-element="atomic-result-item"]'
    // )

    // assert.equal(citationsResults.length, 4)

    // // remove author from page
    // await citationsResults[0].click()
    // await getEditor(driver)
    // await leftKey(actions)

    // await backspaceKey(actions)
    // await isAppInNotesSaved(driver)

    // const allSources = await getElementsByTag(
    //   driver,
    //   '[data-test-element="page-sidebar-item"]'
    // )

    // // author should not appear on sidebar
    // assert.equal(allSources.length, 2)
    assert.equal(1, 1)
  })
})
