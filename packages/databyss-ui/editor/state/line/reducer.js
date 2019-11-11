import { SET_CONTENT } from './constants'

export const initialState = {
  textValue: '',
  ranges: [],
  editableState: null,
}

const setContent = (payload, state) => {
  const _text = payload.textValue
  const _ranges = payload.ranges
  const _state = { ...state, textValue: _text, ranges: _ranges }
  return _state
}

export default (state, action) => {
  switch (action.type) {
    case SET_CONTENT: {
      const _nextState = setContent(action.payload, state)
      return _nextState
    }
    default:
      return state
  }
}
