export const setRef = (ref, value) => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}
export default (...refs) => (value) => {
  refs.forEach((ref) => {
    if (!ref) return
    setRef(ref, value)
  })
}
