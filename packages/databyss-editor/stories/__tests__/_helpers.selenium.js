import { Key, By, until } from 'selenium-webdriver'

const LOCAL_URL = 'http://localhost:3000'
const PROXY_URL = 'http://0.0.0.0:3000'

const waitUntilTime = 30000

const SLEEP_TIME = 300
const MAX_RETRIES = 3

// HACK: saucelabs environment double triggers meta key, use ctrl key instead

const CONTROL = process.env.SAUCE !== 'no' ? Key.CONTROL : Key.META

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

export const getEditor = async (driver) => {
  await sleep(1000)
  const el = await driver.wait(
    until.elementLocated(By.tagName('[contenteditable="true"]')),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )

  const _driver = await driver.wait(
    until.elementIsVisible(el),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )
  return _driver
}

export const getSharedPage = async (driver) => {
  await sleep(1000)
  const el = await driver.wait(
    until.elementLocated(By.tagName('[data-test-element="page-header"]')),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )

  const _driver = await driver.wait(
    until.elementIsVisible(el),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )
  return _driver
}

export const getElementsByTag = async (driver, tag) => {
  await sleep(1000)
  let el = []
  try {
    el = await driver.wait(
      until.elementsLocated(By.tagName(tag)),
      waitUntilTime,
      'Timed out after 30 seconds',
      500
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
  await sleep(1000)
  const el = await driver.wait(
    until.elementLocated(By.tagName(tag)),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )

  // const _driver = await driver.wait(until.elementIsVisible(el), waitUntilTime)
  return el
}

export const tagButtonClick = async (tag, driver) => {
  const actions = driver.actions({ async: true })

  const _clickAction = async (count = 0) => {
    if (count > MAX_RETRIES) {
      throw new Error('Stale Element')
    }
    try {
      const element = await getElementByTag(driver, `[${tag}]`)
      await actions.click(element).perform()
      await actions.clear()
      await sleep(SLEEP_TIME)
    } catch (err) {
      if (err.name !== 'StaleElementReferenceError') {
        throw err
      }
      console.log('Stale element, retrying')

      await _clickAction(count + 1)
    }
  }
  return _clickAction()
}

export const tagButtonListClick = async (tag, index, driver) => {
  const actions = driver.actions({ async: true })

  let count = 0
  const clickAction = async () => {
    if (count > MAX_RETRIES) {
      throw new Error('Stale Element')
    }
    const elements = await getElementsByTag(driver, `[${tag}]`)
    await actions.click(elements[index]).perform()
    await actions.clear()
    await sleep(SLEEP_TIME)
  }
  try {
    await clickAction()
  } catch (err) {
    if (err.name !== 'StaleElementReferenceError') {
      throw err
    }
    console.log('Stale element, retrying')
    count += 1
    await clickAction()
  }
}

export const dragAndDrop = async (item, container, driver) => {
  const actions = driver.actions()

  const _itemElement = await getElementByTag(driver, `[${item}]`)

  const _containerElement = await getElementByTag(driver, `[${container}]`)

  await actions.dragAndDrop(_itemElement, _containerElement).perform()
  await actions.clear()
  await sleep(SLEEP_TIME)
}

export const logout = async (driver) => {
  let count = 0
  const logoutAction = async () => {
    if (count > MAX_RETRIES) {
      return console.error('LOGOUT ERROR')
    }

    await tagButtonClick('data-test-element="account-menu"', driver)

    await sleep(500)
    await tagButtonClick('data-test-block-menu="logout"', driver)

    await getElementByTag(driver, '[data-test-path="email"]')

    await sleep(SLEEP_TIME)

    // todo: driver.quit on logout actions
  }
  try {
    await logoutAction()
  } catch (err) {
    console.log('logout fail - retrying')
    count += 1
    await logoutAction()
  }
}

export const getElementById = async (driver, id) => {
  await sleep(500)
  const el = await driver.wait(
    until.elementLocated(By.id(id)),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )

  const _driver = await driver.wait(
    until.elementIsVisible(el),
    waitUntilTime,
    'Timed out after 30 seconds',
    500
  )
  return _driver
}

export const isSaved = async (driver) => {
  await sleep(2000)
  try {
    await getElementById(driver, 'complete')
  } catch (err) {
    if (err.name !== 'StaleElementReferenceError') {
      console.log(err.name)
      throw err
    }
  }
}

export const isAppInNotesSaved = async (driver) => {
  await sleep(2000)
  try {
    await getElementById(driver, 'changes-saved')
  } catch (err) {
    if (err.name !== 'StaleElementReferenceError') {
      throw err
    }
  }
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
  await sleep(SLEEP_TIME)
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

export const logIn = async (email, driver) => {
  await driver.get(process.env.LOCAL_ENV ? LOCAL_URL : PROXY_URL)

  const emailField = await getElementByTag(driver, '[data-test-path="email"]')
  await emailField.sendKeys(email)

  let continueButton = await getElementByTag(
    driver,
    '[data-test-id="continueButton"]'
  )
  await continueButton.click()

  const codeField = await getElementByTag(driver, '[data-test-path="code"]')
  await codeField.sendKeys('test-code-42')

  continueButton = await getElementByTag(
    driver,
    '[data-test-id="continueButton"]'
  )

  await continueButton.click()

  // wait for editor to be visible
  await getEditor(driver)
}
