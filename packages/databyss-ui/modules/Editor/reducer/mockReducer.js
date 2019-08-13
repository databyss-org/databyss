import * as app from './../actions/mocks'
import { appendBlock, getPos } from './../_helpers'

export const initialState = {
  editRef: {},
  lastCarotPosition: -1,
  editIndex: 0,
  blocks: [
    {
      html: '',
      rawText: 'enter text',
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
  ...app,
}

export const reducer = (state, action) => {
  console.log(state)
  console.log(action.type)
  switch (action.type) {
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
      } else if (action.data.rawText.substring(0, 2) === '##') {
        blocks[action.data.index] = { ...action.data, type: 'TAG' }
        return {
          ...state,
          blocks,
        }
      } else if (action.data.rawText.substring(0, 1) === '#') {
        blocks[action.data.index] = { ...action.data, type: 'HEADER' }
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
        // FOCUS BLOCK
        const newBlocks = appendBlock({
          blocks: state.blocks,
          index: state.editIndex,
          addNewBlock: true,
        })
        return {
          ...state,
          blocks: newBlocks,
        }
      } else {
        blocks[action.data.index] = { ...action.data /*, type: 'ENTRY' */ }
        return {
          ...state,
          blocks,
        }
      }
    case 'BACKSPACE':
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
      // if existing ref
      let index =
        action.data.index === -1 ? state.blocks.length - 1 : action.data.index
      let newBlocks = state.blocks
      newBlocks[index] = {
        ...newBlocks[index],
        ref: action.data.ref,
        index,
      }
      if (action.data.index === -1) {
        action.data.ref.focus()
      }
      return {
        ...state,
        editIndex: index,
        //   contentRef: action.data.ref,
        blocks: newBlocks,
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
      if (state.lastCarotPosition === 0) {
        if (state.editIndex > -1) {
          const index = state.editIndex === 0 ? 0 : state.editIndex - 1
          state.blocks[index].ref.focus()
          // set focus to previous block from 'blocks'
          return {
            ...state,
            lastCarotPosition: getPos(document.activeElement),
            editIndex: index,
          }
        } else {
          // set focus to last block in 'blocks'
          state.blocks[state.blocks.length - 1].ref.focus()
          return {
            ...state,
            lastCarotPosition: getPos(document.activeElement),
            editIndex: state.blocks.length - 1,
          }
        }
      } else {
        return {
          ...state,
          lastCarotPosition: getPos(document.activeElement),
        }
      }
    case 'DOWN':
      console.log(getPos(document.activeElement))
      console.log(
        state.blocks[state.editIndex].rawText.replace(/[\n\r]/, '').length
      )
      return {
        ...state,
        lastCarotPosition: getPos(document.activeElement),
      }
    case 'NEW_LINE':
      const currentBlock = state.blocks[state.editIndex]
      if (
        currentBlock.type === 'RESOURCE' ||
        currentBlock.type === 'LOCATION' ||
        currentBlock.type === 'HEADER' ||
        currentBlock.type === 'TAG'
      ) {
        const newBlocks = appendBlock({
          blocks: state.blocks,
          index: state.editIndex,
          addNewBlock: true,
        })
        return {
          ...state,
          blocks: newBlocks,
        }
      } else {
        return {
          ...state,
        }
      }
    default:
      return state
  }
}
