// import * as app from './../actions/mocks'
import {
  appendBlock,
  getPos,
  removeBlock,
  placeCaretAtEnd,
} from './../_helpers'

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
  console.log(state)
  console.log(action.type)
  switch (action.type) {
    case 'ON_EDIT':
      return {
        ...action.data,
      }
    case 'BACKSPACE':
      if (
        state.blocks[state.editIndex].html.length === 0 &&
        state.blocks[state.editIndex].type === 'NEW'
      ) {
        let blocks = state.blocks
        //  blocks[state.editIndex !== 0 ? state.editIndex - 1 : 0].ref.focus()

        /*
        blocks[state.editIndex] = {
          ...state.blocks[state.editIndex],
          type: 'NEW',
        }
*/

        console.log('change')
        //  blocks = removeBlock({ blocks, index: state.editIndex })
        // blocks[state.editIndex !== 0 ? state.editIndex - 1 : 0].type = 'NEW'
        //  blocks[state.editIndex !== 0 ? state.editIndex - 1 : 0].ref.focus()
        return {
          ...state,
          blocks,
          editIndex: state.editIndex !== 0 ? state.editIndex - 1 : 0,
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
          placeCaretAtEnd(state.blocks[index].ref)
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
      if (
        state.lastCarotPosition ===
        state.blocks[state.editIndex].rawText.replace(/[\n\r]/, '').length
      ) {
        const editIndex =
          state.editIndex + 1 < state.blocks.length
            ? state.editIndex + 1
            : state.editIndex
        state.blocks[editIndex].ref.focus()
        return {
          ...state,
          lastCarotPosition: 0,
          editIndex,
        }
      }
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
