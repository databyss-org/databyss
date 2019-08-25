import {
  SET_ACTIVE_BLOCK_ID,
  SET_ACTIVE_BLOCK_CONTENT,
  SET_ACTIVE_BLOCK_TYPE,
} from './constants'
import draftReducer from './draftReducer'

export const initialState = {
  activeBlockId: null,
  documentView: [],
  blocks: {},
  editorState: null,
}

const updateActiveBlock = (state, block) => ({
  ...state,
  blocks: {
    ...state.blocks,
    [state.activeBlockId]: {
      ...state.blocks[state.activeBlockId],
      ...block,
    },
  },
})

export default (state, action) => {
  const nextState = {
    ...state,
    editorState: draftReducer(
      action.payload.editorState || state.editorState,
      action
    ),
  }
  // console.log('nextState', nextState)
  switch (action.type) {
    case SET_ACTIVE_BLOCK_TYPE:
      return updateActiveBlock(nextState, {
        type: action.payload.type,
      })
    case SET_ACTIVE_BLOCK_ID:
      return {
        ...nextState,
        activeBlockId: action.payload.id,
      }
    case SET_ACTIVE_BLOCK_CONTENT:
      return updateActiveBlock(nextState, {
        rawHtml: action.payload.html,
      })

    default:
      return nextState
  }
}
