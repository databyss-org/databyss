import { Modifier, EditorState } from 'draft-js'
import { SET_ACTIVE_BLOCK_TYPE, SET_ACTIVE_BLOCK_CONTENT } from './constants'

const setActiveBlockType = (draftState, type) => {
  let _nextContentState = draftState.getCurrentContent()
  const _selection = draftState.getSelection()

  _nextContentState = Modifier.setBlockType(
    draftState.getCurrentContent(),
    _selection,
    type
  )

  return _nextContentState
}

export default (draftState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_CONTENT: {
      if (!action.payload.html.length) {
        const _nextContentState = setActiveBlockType(draftState, 'ENTRY')
        return EditorState.push(draftState, _nextContentState)
      }
      return draftState
    }
    case SET_ACTIVE_BLOCK_TYPE: {
      let _nextContentState = setActiveBlockType(
        draftState,
        action.payload.type
      )
      if (action.payload.fromSymbolInput) {
        const _selection = draftState.getSelection()
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
      return EditorState.push(draftState, _nextContentState)
    }
    default:
      return draftState
  }
}
