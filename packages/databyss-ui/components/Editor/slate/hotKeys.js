import { isKeyHotkey } from 'is-hotkey'
import { IS_IOS, IS_MAC } from 'slate-dev-environment'
/**
 * Hotkey mappings for each platform.
 *
 * @type {Object}
 */
const HOTKEYS = {
  bold: 'mod+b',
  italic: 'mod+i',
  undo: 'mod+z',
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
