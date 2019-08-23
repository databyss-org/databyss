export const getBlock = (state, index) => {
  const id = state.document[index]._id
  const block = state.blocks[id]
  return block
}

export const getBlockKeyValue = (state, index) => {
  const id = state.document[index]._id
  const block = state.blocks[id]
  return block
}

export const typeSelector = text => {
  let type = ''
  if (text[0] === '@') {
    type = 'RESOURCE'
  }
  if (text[0] === '#') {
    type = 'HEADER'
  }
  if (text.substring(0, 2) === '//') {
    type = 'LOCATION'
  }

  if (text.substring(0, 2) === '##') {
    type = 'TAG'
  }
  return type
}

export const focusActiveBlock = state => {
  console.log(state)
  const block = getBlock(state, state.activeIndex)
  const query = `[data-byss-blockid='${block._id}']`

  var el = document.querySelectorAll(query)[0]
  console.log(el)
  /*
  if (el) {
    var range = document.createRange()
    var sel = window.getSelection()
    range.setStart(el.childNodes[0], 1)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
    // el.childNodes[0].focus()
  }
  */
  /*
  var range = document.createRange()
  var sel = window.getSelection()

  range.setStart(el.childNodes[0], 1)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
   el.childNodes[0].focus()
*/
  // console.log(others['data-byss-blockid'])
}

export const getSelectedId = e => {
  const _selection = e.target.getSelection()

  let _el = _selection.focusNode.parentElement.closest('[data-byss-blockid]')
  if (_el) {
    return _el.getAttribute('data-byss-blockid')
  }
  _el = _selection.focusNode.closest('[data-byss-blockid]')
  if (_el) {
    return _el.getAttribute('data-byss-blockid')
  }
  return null
}

export const getActiveSelectedEl = () => {
  let el
  const _selection = window.getSelection()
  if (_selection.focusNode.parentElement) {
    return _selection.focusNode.parentElement.closest('[data-byss-blockid]')
  }
  el = _selection.focusNode.closest('[data-byss-blockid]')

  return el ? el : null
}

export const getActiveSelectedId = () => {
  const el = getActiveSelectedEl()
  if (el !== null) {
    return el.getAttribute('data-byss-blockid')
  }
  return
}

export const getPos = element => {
  let caretOffset = 0
  const doc = element.ownerDocument || element.document
  const win = doc.defaultView || doc.parentWindow
  let sel
  if (typeof win.getSelection !== 'undefined') {
    sel = win.getSelection()
    if (sel.rangeCount > 0) {
      const range = win.getSelection().getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      caretOffset = preCaretRange.toString().length
    }
  } else if ((sel = doc.selection) && sel.type != 'Control') {
    const textRange = sel.createRange()
    const preCaretTextRange = doc.body.createTextRange()
    preCaretTextRange.moveToElementText(element)
    preCaretTextRange.setEndPoint('EndToEnd', textRange)
    caretOffset = preCaretTextRange.text.length
  }
  return caretOffset
}

export const placeCaretAtEnd = el => {
  el.focus()
  if (
    typeof window.getSelection !== 'undefined' &&
    typeof document.createRange !== 'undefined'
  ) {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  } else if (typeof document.body.createTextRange !== 'undefined') {
    const textRange = document.body.createTextRange()
    textRange.moveToElementText(el)
    textRange.collapse(false)
    textRange.select()
  }
}

export const setCaretPos = (state, pos) => {
  const textNode = getTextNode(state).firstChild
  var caret = pos // insert caret after the 10th character say
  var range = document.createRange()
  range.setStart(textNode, caret)
  range.setEnd(textNode, caret)
  var sel = window.getSelection()
  console.log(sel)
  sel.removeAllRanges()
  sel.addRange(range)
}

export const getTextNode = state => {
  const block = getBlock(state, state.activeIndex)
  const query = `[data-byss-blockid='${block._id}']`

  var node = document.querySelectorAll(query)[0]
  // node.focus()
  var textNode = node.firstChild.childNodes[1].firstChild

  return textNode ? textNode : null
}
