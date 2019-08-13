export const actions = dispatch => ({
  setRef: ({ ref, index }) =>
    dispatch({ type: 'SET_REF', data: { ref, index } }),
  setEditRef: (ref, i) => {
    dispatch({ type: 'EDIT_REF', data: ref.current, index: i })
  },
  setFocus: () => {
    dispatch({ type: 'SET_FOCUS' })
  },
  onEdit: data => {
    dispatch({ type: 'ON_EDIT', data })
  },
  onBackspace: () => {
    dispatch({ type: 'BACKSPACE' })
  },
  onNewLine: () => {
    dispatch({ type: 'NEW_LINE' })
  },
  onUpKey: () => {
    dispatch({ type: 'UP' })
  },
  onDownKey: () => {
    dispatch({ type: 'DOWN' })
  },
})
