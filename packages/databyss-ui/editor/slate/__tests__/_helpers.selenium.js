import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

// export const CONTROL = Key.META

export const sleep = m => new Promise(r => setTimeout(r, m))

export const endOfLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const paste = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('v')
    .keyUp(CONTROL)
    .perform()

export const copy = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('c')
    .keyUp(CONTROL)
    .perform()

export const selectAll = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('a')
    .keyUp(CONTROL)
    .perform()

export const nextBlock = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('p')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const endOfDoc = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_DOWN)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const startOfDoc = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_UP)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const previousLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('o')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const nextLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('p')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .perform()

export const highlightSingleSpace = actions =>
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
    .perform()

export const getEditor = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.css('[contenteditable="true"]')),
    waitUntilTime
  )
  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}
