/* eslint-disable func-names */
import { Key } from 'selenium-webdriver'
import assert from 'assert'
import { startSession } from '@databyss-org/ui/lib/saucelabs'
import { sleep, getElementById, getElementByTag } from './_helpers.selenium'

let driver
let actions

// let actions
const LOCAL_URL =
  'http://localhost:6006/iframe.html?id=selenium-tests--valuelist-controller'
const PROXY_URL =
  'http://0.0.0.0:8080/iframe.html?id=selenium-tests--valuelist-controller'

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

describe('value list controller', () => {
  beforeEach(async done => {
    // OSX and safari are necessary
    driver = await startSession()
    await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

    actions = driver.actions()
    done()
  })

  afterEach(async () => {
    await driver.close()
    driver = null
  })

  afterAll(async () => {
    await driver.quit()
  })

  it('should accept inputs', async () => {
    // name = await getElementByTag(driver, '[data-test-path="text"]')

    const name = await getElementByTag(driver, '[data-test-path="text"]')

    await name.click()
    // await actions.sendKeys('\t')
    await actions.sendKeys('Name of text')
    await actions.sendKeys('\t')

    await actions.sendKeys('First name of source')
    await actions.sendKeys('\t')

    await actions.sendKeys('Last name of source')
    await actions.sendKeys('\t')
    await actions.sendKeys('citations of source')

    await actions.perform()

    await sleep(1000)

    let citationsField = await getElementById(driver, 'citation')

    citationsField = await citationsField.getText()

    let nameField = await getElementById(driver, 'name')

    nameField = await nameField.getText()

    let firstName = await getElementById(driver, 'firstName')

    firstName = await firstName.getAttribute('value')

    let lastName = await getElementById(driver, 'lastName')

    lastName = await lastName.getAttribute('value')

    assert.equal(citationsField, 'citations of source')

    assert.equal(nameField, 'Name of text')

    assert.equal(firstName, 'First name of source')

    assert.equal(lastName, 'Last name of source')
  })
})
