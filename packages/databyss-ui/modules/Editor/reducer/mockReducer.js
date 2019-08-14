// import * as app from './../actions/mocks'
import { getPos } from './../_helpers'

export const initialState = {
  editRef: {},
  lastCarotPosition: -1,
  editIndex: 0,
  blocks: [
    {
      html: '',
      rawText: '',
      source: { name: '' },
      type: '',
      ref: {},
      index: 0,
    },
  ],
  menu: {
    action: { type: '' },
    items: [{ type: '' }],
  },
}

export const reducer = (state, action) => {
  console.log(action.type)
  console.log(state)
  switch (action.type) {
    case 'ON_EDIT':
      return {
        ...state,
        ...action.data,
      }
    case 'BACKSPACE':
      return {
        ...state,
      }
    case 'SET_REF':
      return {
        ...state,
        blocks: action.data,
        editIndex: action.index,
        lastCarotPosition: getPos(document.activeElement),
      }

    case 'FOCUS_BLOCK':
      action.data.focus()
      return {
        ...state,
        editIndex: action.index,
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
    case 'UP':
      return {
        ...state,
        ...action.data,
      }

    case 'DOWN':
      return {
        ...state,
        ...action.data,
      }
    case 'NEW_LINE':
      return {
        ...state,
        ...action.data,
      }
    default:
      return state
  }
}
