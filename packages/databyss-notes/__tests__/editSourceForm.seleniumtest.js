/* eslint-disable func-names */
import assert from 'assert'

import { startSession, WIN, CHROME } from '@databyss-org/ui/lib/saucelabs'

import {
  enterKey,
  getElementByTag,
  isAppInNotesSaved,
  rightKey,
  sendKeys,
  sleep,
  tabKey,
  upKey,
  tagButtonClick,
  login,
  tagButtonListClick,
  downKey,
  tryQuit,
} from './util.selenium'

let driver
let actions

describe('EditSourceForm', () => {
  beforeEach(async (done) => {
    driver = await startSession({ platformName: WIN, browserName: CHROME })
    await login(driver)
    actions = driver.actions()
    await downKey(actions)
    done()
  })

  afterEach(async (done) => {
    await tryQuit(driver)
    done()
  })

  it('should be able to change source title', async () => {
    const sourceTitle = 'some source title'

    await sleep(300)

    // write to editor
    await sendKeys(actions, `@${sourceTitle}`)
    await enterKey(actions)
    await isAppInNotesSaved(driver)

    await sleep(1000)

    // select newly created source block
    await upKey(actions)
    await rightKey(actions)

    // open modal
    await enterKey(actions)
    await sleep(1000)
    await tagButtonClick('data-test-button="open-source-modal"', driver)
    await sleep(1000)

    // FIXME: focus should be set to modal component on open

    // HACK: select element to be able to start keyboard navigation
    // await tagButtonClick('data-test-path="text"', driver)

    // reach publication title field
    await tabKey(actions)
    await sleep(1000)
    await tabKey(actions)
    await sleep(1000)
    await tabKey(actions)
    await sleep(1000)
    await tabKey(actions)

    // enter values to test later
    await sendKeys(actions, sourceTitle)

    // dismiss modal
    await tagButtonClick('data-test-dismiss-modal="true"', driver)

    await sleep(500)

    await tagButtonListClick(
      'data-test-element="atomic-result-item"',
      0,
      driver
    )

    await sleep(1000)

    // select source block anew
    // await upKey(actions)
    await rightKey(actions)

    // open modal
    await enterKey(actions)
    await sleep(1000)
    await tagButtonClick('data-test-button="open-source-modal"', driver)

    // ensure source title is what has been entered previously
    const titleLabeledInput = await getElementByTag(
      driver,
      '[data-test-id="edfTitle"]'
    )
    const titleValue = await titleLabeledInput.getText()
    assert.equal(titleValue, sourceTitle)
  })
})
