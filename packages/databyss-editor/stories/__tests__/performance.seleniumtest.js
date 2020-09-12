/* eslint-disable func-names */
// import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
// import { jsx as h } from './hyperscript'
// import { sanitizeEditorChildren } from './__helpers'
import {
  // getEditor,
  getElementById,
  sleep,
} from './_helpers.selenium'

const SAMPLE_SIZE = 10
let driver
// let editor
let loadingTime
let clearBlocksButton
// let fpsButton
let smallBlocksButton
// let medBlocksButton
// let largeBlocksButton
// let fpsRate

function getAvg(threshold) {
  const total = threshold.reduce((acc, c) => acc + c, 0)
  return parseFloat(total / threshold.length)
}

// let actions
const LOCAL_URL =
  'http://localhost:6006/iframe.html?id=selenium-tests--slate-5-editor-performance'
const PROXY_URL =
  'http://0.0.0.0:8080/iframe.html?id=selenium-tests--slate-5-editor-performance'

describe('editor performance', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)
    await sleep(1000)
    // editor = await getEditor(driver)

    // buttons
    clearBlocksButton = await getElementById(driver, 'clear-blocks')
    // fpsButton = await getElementById(driver, 'set-fps')
    smallBlocksButton = await getElementById(driver, 'small-blocks')
    // medBlocksButton = await getElementById(driver, 'med-blocks')
    // largeBlocksButton = await getElementById(driver, 'large-blocks')

    // markers
    loadingTime = await getElementById(driver, 'loading-stats')

    // fpsRate = await getElementById(driver, 'fps-stats')

    //   actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })
  it('should test for loading time', async () => {
    await sleep(300)
    const _times = []
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < SAMPLE_SIZE; i += 1) {
      await clearBlocksButton.click()
      await smallBlocksButton.click()
      const _loadingTime = await loadingTime.getText()
      _times.push(parseFloat(_loadingTime))
    }

    const _averageTime = getAvg(_times)

    // console.log(_averageTime)
    await sleep(3000)

    assert.equal(_averageTime < 0.5, true)
  })
})
