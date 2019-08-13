import _ from 'lodash'
import { appendBlock } from './../_helpers.js'

export const actions = (dispatch, state) => {
  console.log(state)
  const setRef = ({ ref, index }) => {
    dispatch({ type: 'SET_REF', data: { ref, index } })
  }

  const setEditRef = (ref, i) => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
  }

  const setFocus = () => {
    dispatch({ type: 'SET_FOCUS' })
  }

  const onEdit = data => {
    let newState = state
    if (!_.isEqual(data === state.blocks[state.editIndex])) {
      let blocks = state.blocks
      if (data.rawText.length === 0) {
        blocks[data.index] = {
          ...data,
          html: '',
          rawText: '',
          type: 'NEW',
        }
        newState.blocks = blocks
      } else if (data.rawText[0] === '@') {
        blocks[data.index] = { ...data, type: 'RESOURCE' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 2) === '##') {
        blocks[data.index] = { ...data, type: 'TAG' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 1) === '#') {
        blocks[data.index] = { ...data, type: 'HEADER' }
        newState.blocks = blocks
      } else if (data.rawText.substring(0, 2) === '//') {
        blocks[data.index] = { ...data, type: 'LOCATION' }
        newState.blocks = blocks
      } else if (data.html.match('<div><br></div><div><br></div>')) {
        // FOCUS BLOCK
        const newBlocks = appendBlock({
          blocks: state.blocks,
          index: state.editIndex,
          addNewBlock: true,
        })
        newState.blocks = newBlocks
      } else {
        blocks[data.index] = { ...data /*, type: 'ENTRY' */ }
        newState.blocks = blocks
      }
    }
    dispatch({ type: 'ON_EDIT', data: newState })
  }

  const onBackspace = () => {
    dispatch({ type: 'BACKSPACE' })
  }
  const onNewLine = () => {
    dispatch({ type: 'NEW_LINE' })
  }

  const onUpKey = () => {
    dispatch({ type: 'UP' })
  }

  const onDownKey = () => {
    dispatch({ type: 'DOWN' })
  }

  return {
    setRef,
    setEditRef,
    setFocus,
    onEdit,
    onBackspace,
    onNewLine,
    onUpKey,
    onDownKey,
  }
}
