/** @jsx h */
/* eslint-disable func-names */
import { By, Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession, OSX, SAFARI } from '@databyss-org/ui/lib/saucelabs'
import { jsx as h } from './hyperscript'
import { sanitizeEditorChildren } from './__helpers'
import {
  getEditor,
  sleep,
  getElementById,
  getElementByTag,
} from './_helpers.selenium'

let driver
let actions
let editor
let formDocuments

// let actions
const LOCAL_URL =
  'http://localhost:6006/iframe.html?id=cypress-tests--valuelist-controller'
const PROXY_URL =
  'http://0.0.0.0:8080/iframe.html?id=cypress-tests--valuelist-controller'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('value list controller', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession('Slate-5-basic-osx-safari', OSX, SAFARI)
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    // formDocuments = await getElementById(driver, 'formDocuments')
    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.quit()
  })
  it('should accept inputs', async () => {
    // name = await getElementByTag(driver, '[data-test-path="text"]')

    let name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    await actions.sendKeys('\t')
    await actions.sendKeys('Name of text')
    await actions.sendKeys('\t')

    await actions.sendKeys('First name of source')
    await actions.sendKeys('\t')

    await actions.sendKeys('Last name of source')
    await actions.sendKeys('\t')
    await actions.sendKeys('citations of source')

    await actions.perform()

    // await name.sendKeys('first name')
    // TODO: CHECK VALUES
    assert.equal(true, true)
  })
})
