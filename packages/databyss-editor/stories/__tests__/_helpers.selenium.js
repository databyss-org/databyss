import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

// export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.ALT

let CONTROL = Key.META

// if (process.env.NPM_BUILD_TARGET === 'TEST') {
//   console.log('IS IN ENVIRONTMENT')
//   CONTROL = Key.CONTROL
// }

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
    .keyDown(CONTROL)
    .sendKeys('b')
    .keyUp(CONTROL)

export const toggleItalic = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('i')
    .keyUp(CONTROL)

export const toggleLocation = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('k')
    .keyUp(CONTROL)

export const singleHighlight = actions => {
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
}
