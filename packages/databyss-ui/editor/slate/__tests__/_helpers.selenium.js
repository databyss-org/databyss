import { Key } from 'selenium-webdriver'

export const endOfLine = driver =>
  driver.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.ARROW_RIGHT))

export const nextBlock = driver =>
  driver.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, 'p'))

export const endOfDoc = driver =>
  driver.sendKeys(Key.chord(Key.CONTROL, Key.SHIFT, Key.ARROW_DOWN))
