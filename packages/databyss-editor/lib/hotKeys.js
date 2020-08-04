import { isKeyHotkey } from 'is-hotkey'
import { IS_IOS, IS_MAC } from 'slate-dev-environment'

// HACK: saucelabs environment double triggers meta key, use ctrl key instead
export const metaKey = process.env.STORYBOOK_SAUCE ? 'ctrl' : 'mod'

export const START_OF_LINE = 'START_OF_LINE'
export const END_OF_LINE = 'END_OF_LINE'
export const START_OF_DOCUMENT = 'START_OF_DOCUMENT'
export const END_OF_DOCUMENT = 'END_OF_DOCUMENT'
export const NEXT_BLOCK = 'NEXT_BLOCK'
export const PREVIOUS_BLOCK = 'PREVIOUS_BLOCK'
export const TAB = 'TAB'
/**
 * Hotkey mappings for each platform.
 *
 * @type {Object}
 */
const HOTKEYS = {
  bold: `${metaKey}+b`,
  italic: `${metaKey}+i`,
  location: `${metaKey}+k`,
  cut: `${metaKey}+x`,
  copy: `${metaKey}+c`,
  paste: `${metaKey}+v`,
  undo: `${metaKey}+z`,
  redo: `${metaKey}+shift+z`,
  startOfLine: `ctrl+shift+left`,
  tab: 'tab',
  endOfLine: `ctrl+shift+right`,
  startOfDocument: `ctrl+shift+up`,
  endOfDocument: `ctrl+shift+down`,
  nextBlock: `ctrl+shift+p`,
  previousBlock: `ctrl+shift+o`,
  esc: 'esc',
  arrowLeft: `ArrowLeft`,
  arrowRight: 'ArrowRight',
  backspace: 'Backspace',
}
const APPLE_HOTKEYS = {}
const WINDOWS_HOTKEYS = {}
/**
 * Hotkeys.
 *
 * @type {Object}
 */
const Hotkeys = {}
const IS_APPLE = IS_IOS || IS_MAC

const IS_WINDOWS = !IS_APPLE
const KEYS = []
  .concat(Object.keys(HOTKEYS))
  .concat(Object.keys(APPLE_HOTKEYS))
  .concat(Object.keys(WINDOWS_HOTKEYS))
KEYS.forEach(key => {
  const method = `is${key[0].toUpperCase()}${key.slice(1)}`
  if (Hotkeys[method]) return
  const generic = HOTKEYS[key]
  const apple = APPLE_HOTKEYS[key]
  const windows = WINDOWS_HOTKEYS[key]
  const isGeneric = generic && isKeyHotkey(generic)
  const isApple = apple && isKeyHotkey(apple)
  const isWindows = windows && isKeyHotkey(windows)
  Hotkeys[method] = event => {
    if (isGeneric && isGeneric(event)) return true
    if (IS_APPLE && isApple && isApple(event)) return true
    if (IS_WINDOWS && isWindows && isWindows(event)) return true
    return false
  }
})
/**
 * Export.
 *
 * @type {Object}
 */
export default Hotkeys

// tries to determine whether this keyboard event will print a character
export const isPrintable = event => {
  const code = event.keyCode
  const modified =
    event.getModifierState('Control') || event.getModifierState('Meta')
  return (
    !modified &&
    ((code > 47 && code < 58) || // number keys
    code === 32 ||
    code === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (code > 64 && code < 91) || // letter keys
    (code > 95 && code < 112) || // numpad keys
    (code > 185 && code < 193) || // ;=,-./` (in order)
      (code > 218 && code < 223)) // [\]' (in order)
  )
}
