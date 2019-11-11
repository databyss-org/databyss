import { Modifier, EditorState } from 'draft-js'
import {
  SET_ACTIVE_BLOCK_TYPE,
  SET_ACTIVE_BLOCK_CONTENT,
} from '../state/page/constants'

const setActiveBlockType = (editableState, type) => {
  let _nextContentState = editableState.getCurrentContent()
  const _selection = editableState.getSelection()

  _nextContentState = Modifier.setBlockType(
    editableState.getCurrentContent(),
    _selection,
    type
  )

  return _nextContentState
}

export default (editableState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_CONTENT: {
      if (!action.payload.html.length) {
        const _nextContentState = setActiveBlockType(editableState, 'ENTRY')
        return EditorState.push(editableState, _nextContentState)
      }
      return editableState
    }
    case SET_ACTIVE_BLOCK_TYPE: {
      let _nextContentState = setActiveBlockType(
        editableState,
        action.payload.type
      )
      if (action.payload.fromSymbolInput) {
        const _selection = editableState.getSelection()
        const _rangeToRemove = _selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        })
        _nextContentState = Modifier.removeRange(
          _nextContentState,
          _rangeToRemove,
          'forward'
        )
      }
      return EditorState.push(editableState, _nextContentState)
    }
    default:
      return editableState
  }
}
