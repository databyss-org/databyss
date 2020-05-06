import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

export const sleep = m => new Promise(r => setTimeout(r, m))

export const getEditor = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.css('[contenteditable="true"]')),
    waitUntilTime
  )
  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}
