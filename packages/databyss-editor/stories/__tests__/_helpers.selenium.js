import { Key, By, until } from 'selenium-webdriver'
import { IS_IOS, IS_MAC } from 'slate-dev-environment'
// import { IS_LINUX } from '@databyss-org/ui/lib/dom'

const waitUntilTime = 20000

// console.log('is mac', IS_MAC)
// console.log('is IOS', IS_IOS)

// export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.ALT
// export const CONTROL = IS_IOS || IS_MAC ? Key.META : Key.CONTROL
export const CONTROL = Key.COMMAND

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
    .keyDown(CONTROL)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(CONTROL)
}
