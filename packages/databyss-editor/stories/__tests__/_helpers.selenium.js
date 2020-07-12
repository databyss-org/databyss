import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

const SLEEP_TIME = 500

// HACK: saucelabs environment double triggers meta key, use ctrl key instead

const CONTROL = process.env.SAUCE !== 'no' ? Key.CONTROL : Key.META

export const sleep = m => new Promise(r => setTimeout(r, m))

export const retry = (asyncFunction, times = 3) => {
  try {
    await asyncFunction()
  } catch (err) {
    if (times === 0) {
      throw err
    }
    console.warn(err)
    console.log(`RETRYING ${times} more times`)
    retry(asyncFunction, times)
  }
}

export const getEditor = async driver => {
  const el = await driver.wait(
    until.elementLocated(By.tagName('[contenteditable="true"]')),
    waitUntilTime
  )

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getElementByTag = async (driver, tag) => {
  const el = await driver.wait(
    until.elementLocated(By.tagName(tag)),
    waitUntilTime
  )

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getElementById = async (driver, id) => {
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime)

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

const navigationActionsBuilder = async (actions, key) => {
  await actions.sendKeys(key)
  await actions.perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const enterKey = async actions => {
  await navigationActionsBuilder(actions, Key.ENTER)
}

export const upKey = async actions => {
  await navigationActionsBuilder(actions, Key.ARROW_UP)
}

export const downKey = async actions => {
  await navigationActionsBuilder(actions, Key.ARROW_DOWN)
}

export const backspaceKey = async actions => {
  await navigationActionsBuilder(actions, Key.BACK_SPACE)
}
