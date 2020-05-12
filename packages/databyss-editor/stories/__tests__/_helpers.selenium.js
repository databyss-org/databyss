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

export const toggleBold = actions =>
  actions
    .keyDown(Key.META)
    .sendKeys('b')
    .keyUp(Key.META)

export const toggleItalic = actions =>
  actions
    .keyDown(Key.META)
    .sendKeys('i')
    .keyUp(Key.META)

export const toggleLocation = actions =>
  actions
    .keyDown(Key.META)
    .sendKeys('k')
    .keyUp(Key.META)

export const singleHighlight = actions => {
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
}
