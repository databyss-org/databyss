import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

export const CONTROL = process.env.LOCAL_ENV ? Key.META : Key.CONTROL

// export const CONTROL = Key.META

export const sleep = m => new Promise(r => setTimeout(r, m))

// export const endOfLine = driver =>
//   driver.sendKeys(Key.chord(CONTROL, Key.SHIFT, Key.ARROW_RIGHT))

export const endOfLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const startOfLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_LEFT)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const paste = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('v')
    .keyUp(CONTROL)
    .pause(100)

export const copy = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('c')
    .keyUp(CONTROL)
    .pause(100)

export const selectAll = actions =>
  actions
    .keyDown(CONTROL)
    .sendKeys('a')
    .keyUp(CONTROL)
    .pause(100)

export const nextBlock = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('p')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const endOfDoc = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_DOWN)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const startOfDoc = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_UP)
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const previousLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('o')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const nextLine = actions =>
  actions
    .keyDown(Key.CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('p')
    .keyUp(Key.CONTROL)
    .keyUp(Key.SHIFT)
    .pause(100)

export const sendText = actions => actions.sendKeys('stuff')

export const highlightSingleSpace = actions =>
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
    .pause(100)

export const highlightSingleLine = actions =>
  actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_UP)
    .keyUp(Key.SHIFT)
    .pause(100)

export const getEditor = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.css('[contenteditable="true"]')),
    waitUntilTime
  )
  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getBody = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.css('body')),
    waitUntilTime
  )
  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}
