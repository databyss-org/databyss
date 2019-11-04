import { TOGGLE_MARK, HOTKEY } from '../../state/line/constants'
// import { addTag } from '../state/actions'

export const findActiveBlock = value =>
  value.document.getClosestBlock(value.selection.focus.key)

const toggleMark = mark => (editor, value, next) => {
  editor.toggleMark(mark)
  next(editor, value)
}

const onHotKey = command => (editor, value, next) => {
  const _node = findActiveBlock(editor.value)
  ;({
    START_OF_LINE: () => editor.moveToStartOfNode(_node),
    END_OF_LINE: () => editor.moveToEndOfNode(_node),
    START_OF_DOCUMENT: () => editor.moveToStartOfDocument(),
    END_OF_DOCUMENT: () => editor.moveToEndOfDocument(),
    NEXT_BLOCK: () => editor.moveToStartOfNextBlock(),
    PREVIOUS_BLOCK: () => editor.moveToStartOfPreviousBlock(),
    TAB: () => editor.insertText('\t'),
  }[command]())

  next(editor, value)
}

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
