import { Modifier, EditorState } from 'draft-js'
import { SET_ACTIVE_BLOCK_TYPE } from './constants'

export default (editorState, action) => {
  switch (action.type) {
    case SET_ACTIVE_BLOCK_TYPE:
      console.log('draftReducer.SET_ACTIVE_BLOCK_TYPE')
      let _nextContentState = editorState.getCurrentContent()
      const _selection = editorState.getSelection()
      _nextContentState = Modifier.setBlockType(
        editorState.getCurrentContent(),
        _selection,
        action.payload.type
      )
      const _rangeToRemove = _selection.merge({
        anchorOffset: 0,
        focusOffset: 0,
      })
      _nextContentState = Modifier.removeRange(
        _nextContentState,
        _rangeToRemove,
        'forward'
      )
      return EditorState.push(editorState, _nextContentState)
    default:
      return editorState
  }
}
