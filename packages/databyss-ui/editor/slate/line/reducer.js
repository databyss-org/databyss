import { TOGGLE_MARK, HOTKEY } from '../../state/line/constants'

import { toggleMark, onHotKey } from './../page/reducer'

export default (editableState, action) => {
  switch (action.type) {
    // this one
    case TOGGLE_MARK:
      return {
        ...editableState,
        editorCommands: toggleMark(action.payload.mark),
      }

    // this one
    case HOTKEY: {
      return {
        ...editableState,
        editorCommands: onHotKey(action.payload.command),
      }
    }

    default:
      return editableState
  }
}
