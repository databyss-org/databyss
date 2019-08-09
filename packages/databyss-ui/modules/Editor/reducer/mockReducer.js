import * as app from './../actions/mocks'
import { appendBlock } from './../_helpers'

export const initialState = {
  contentRef: {},
  editRef: {},
  editIndex: -1,
  blocks: [],
  menu: {
    action: { type: '' },
    items: [{ type: '' }],
  },
  blockState: {
    html: '',
    rawText: 'enter text',
    source: { name: '' },
    type: '',
  },
  ...app,
}

export const reducer = (state, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'ON_CHANGE':
      if (action.data.rawText.length === 0) {
        if (action.data.index > -1) {
          let blocks = state.blocks
          blocks[action.data.index] = { ...action.data, html: '', type: '' }
          return {
            ...state,
            blocks,
          }
        } else {
          return {
            ...state,
            blockState: { ...action.data, html: '', type: '' },
          }
        }
      } else if (action.data.html[0] === '@') {
        return {
          ...state,
          blockState: { ...action.data, type: 'RESOURCE' },
        }
      } else if (action.data.html[0] === '#') {
        return {
          ...state,
          blockState: { ...action.data, type: 'TAG' },
        }
      } else if (action.data.html.substring(0, 2) === '//') {
        return {
          ...state,
          blockState: { ...action.data, type: 'LOCATION' },
        }
      } else if (action.data.html.match('<div><br></div><div><br></div>')) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: action.data,
        })
        return {
          ...state,
          blockState: { ...action.data, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        return {
          ...state,
          blockState: { ...action.data, type: 'ENTRY' },
        }
      }
    case 'ON_EDIT':
      let blocks = state.blocks
      if (action.data.rawText.length === 0) {
        blocks[action.data.index] = { ...action.data, html: '', type: '' }
        return {
          ...state,
          blocks,
        }
      } else if (action.data.rawText[0] === '@') {
        blocks[action.data.index] = { ...action.data, type: 'RESOURCE' }
        return {
          ...state,
          blocks,
        }
      } else if (action.data.rawText[0] === '#') {
        blocks[action.data.index] = { ...action.data, type: 'TAG' }
        return {
          ...state,
          blocks,
        }
      } else if (action.data.rawText.substring(0, 2) === '//') {
        blocks[action.data.index] = { ...action.data, type: 'LOCATION' }
        return {
          ...state,
          blocks,
        }
      } else if (action.data.html.match('<div><br></div><div><br></div>')) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: action.data,
        })
        return {
          ...state,
          blockState: { ...action.data, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        blocks[action.data.index] = { ...action.data }
        return {
          ...state,
          blocks,
        }
      }
    case 'BACKSPACE':
      if (state.blockState.html.length === 0) {
        return {
          ...state,
          blockState: { ...state.blockState, type: 'NEW' },
        }
      } else {
        return {
          ...state,
        }
      }
    case 'BACKSPACE_EDIT':
      if (state.blocks[state.editIndex].html.length === 0) {
        let blocks = state.blocks
        blocks[state.editIndex] = {
          ...state.blocks[state.editIndex],
          type: 'NEW',
        }
        return {
          ...state,
          blocks,
        }
      } else {
        return {
          ...state,
        }
      }
    case 'SET_REF':
      return {
        ...state,
        contentRef: action.data,
      }
    case 'EDIT_REF':
      return {
        ...state,
        editRef: action.data,
        editIndex: action.index,
      }
    case 'SET_FOCUS':
      return {
        ...state,
        blockState: { ...state.blockState, type: 'NEW' },
      }
    case 'NEW_LINE':
      if (
        state.blockState.type === 'RESOURCE' ||
        state.blockState.type === 'LOCATION' ||
        state.blockState.type === 'TAG'
      ) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: state.blockState,
        })
        return {
          ...state,
          blockState: { ...state.blockState, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        return {
          ...state,
          blockState: { ...state.blockState },
        }
      }

    case 'NEW_LINE_EDIT':
      /*

      need to change to 'blocks'
      if (
        state.blockState.type === 'RESOURCE' ||
        state.blockState.type === 'LOCATION' ||
        state.blockState.type === 'TAG'
      ) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          newBlockInfo: state.blockState,
        })
        return {
          ...state,
          blockState: { ...state.blockState, html: '', type: 'NEW_ELEMENT' },
          blocks: newBlocks,
        }
      } else {
        */
      return {
        ...state,
        blockState: { ...state.blockState },
      }
    // }

    default:
      return state
  }
}
