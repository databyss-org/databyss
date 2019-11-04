import { SET_CONTENT } from './constants'

export function setContent(html, editableState, ranges) {
  console.log('STTTING CONTENT')
  return {
    type: SET_CONTENT,
    payload: {
      html,
      editableState,
      ranges,
    },
  }
}
