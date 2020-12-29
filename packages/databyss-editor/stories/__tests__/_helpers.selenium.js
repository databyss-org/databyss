import { Key, By, until } from 'selenium-webdriver'

const waitUntilTime = 20000

const SLEEP_TIME = 300

// HACK: saucelabs environment double triggers meta key, use ctrl key instead

const CONTROL = process.env.SAUCE !== 'no' ? Key.CONTROL : Key.META

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

export const getEditor = async (driver) => {
  await sleep(500)
  const el = await driver.wait(
    until.elementLocated(By.tagName('[contenteditable="true"]')),
    waitUntilTime
  )

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

export const getElementsByTag = async (driver, tag) => {
  await sleep(500)
  let el = []
  try {
    el = await driver.wait(
      until.elementsLocated(By.tagName(tag)),
      waitUntilTime
    )
  } catch (ex) {
    if (ex.name !== 'TimeoutError') {
      throw ex
    }
  }

  // const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return el
}

export const getElementByTag = async (driver, tag) => {
  await sleep(500)
  const el = await driver.wait(
    until.elementLocated(By.tagName(tag)),
    waitUntilTime
  )

  // const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return el
}

export const getElementById = async (driver, id) => {
  await sleep(500)
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime)

  const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return _driver
}

/*
TODO: patches dont update now in storybook when compleated
*/

export const isSaved = async () => {
  await sleep(3000)
  // await getElementById(driver, 'complete')
}

// same issue as above
export const isAppInNotesSaved = async () => {
  await sleep(3000)

  // await getElementById(driver, 'changes-saved')
}

export const toggleBold = (actions) =>
  actions.keyDown(CONTROL).sendKeys('b').keyUp(CONTROL)

export const toggleItalic = (actions) =>
  actions.keyDown(CONTROL).sendKeys('i').keyUp(CONTROL)

export const toggleLocation = (actions) =>
  actions.keyDown(CONTROL).sendKeys('k').keyUp(CONTROL)

export const singleHighlight = async (actions) => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
    .perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

const navigationActionsBuilder = async (actions, key) => {
  await actions.sendKeys(key)
  await actions.perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const sendKeys = async (actions, keys) => {
  await navigationActionsBuilder(actions, keys)
}

export const enterKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ENTER)
}

export const upKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ARROW_UP)
}

export const escapeKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ESCAPE)
}

export const tabKey = async (actions) => {
  await navigationActionsBuilder(actions, '\t')
}

export const downKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ARROW_DOWN)
}

export const rightKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ARROW_RIGHT)
}

export const leftKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.ARROW_LEFT)
}

export const backspaceKey = async (actions) => {
  await navigationActionsBuilder(actions, Key.BACK_SPACE)
}

export const selectAll = async (actions) => {
  await actions.keyDown(CONTROL).sendKeys('a').keyUp(CONTROL).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const copy = async (actions) => {
  await actions.keyDown(CONTROL).sendKeys('c').keyUp(CONTROL).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const cut = async (actions) => {
  await actions.keyDown(CONTROL).sendKeys('x').keyUp(CONTROL).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const paste = async (actions) => {
  await actions.keyDown(CONTROL).sendKeys('v').keyUp(CONTROL).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const upShiftKey = async (actions) => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_UP)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const rightShiftKey = async (actions) => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_RIGHT)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const leftShiftKey = async (actions) => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_LEFT)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const downShiftKey = async (actions) => {
  await actions
    .keyDown(Key.SHIFT)
    .sendKeys(Key.ARROW_DOWN)
    .keyUp(Key.SHIFT)
    .perform()

  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const undo = async (actions) => {
  await actions.keyDown(CONTROL).sendKeys('z').keyUp(CONTROL).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const redo = async (actions) => {
  await actions
    .keyDown(CONTROL)
    .keyDown(Key.SHIFT)
    .sendKeys('z')
    .keyUp(Key.SHIFT)
    .keyUp(CONTROL)
    .perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

// export const upKey = async actions => {
//   await actions
//     .keyUp(Key.ARROW_UP)
//     .perform()

//   await actions.clear()
//   await sleep(SLEEP_TIME)
// }
