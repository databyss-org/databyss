import { By, Key } from 'selenium-webdriver'
import { startSession } from '../../../lib/saucelabs'

let driver

describe('clipboard-win-chrome', () => {
  beforeEach(async () => {
    driver = await startSession('clipboard-win-chrome')
  })

  afterEach(async () => {
    await driver.quit()
  })

  it('cut-paste', async () => {
    await driver.get('https://www.saucedemo.com')
    await driver.findElement(By.id('user-name')).sendKeys('secret_sauce')
    await driver.findElement(By.id('user-name')).sendKeys(Key.CONTROL, 'a')
    await driver.findElement(By.id('user-name')).sendKeys(Key.CONTROL, 'x')
    await driver.findElement(By.id('password')).sendKeys(Key.CONTROL, 'v')
    await driver.findElement(By.id('user-name')).sendKeys('standard_user')
    await driver.findElement(By.className('btn_action')).click()
    const currentURL = await driver.getCurrentUrl()
    expect(currentURL).toEqual('https://www.saucedemo.com/inventory.html')
  })
})
