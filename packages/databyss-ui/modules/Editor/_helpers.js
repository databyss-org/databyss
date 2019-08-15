import _ from 'lodash'

const emptyBlock = {
  html: '',
  rawText: '',
  source: { name: '' },
  type: '',
  ref: {},
  index: -1,
}

export const styleSelector = type => {
  switch (type) {
    case 'RESOURCE':
      return { style: 'bodyNormalUnderline', color: '' }
    case 'LOCATION':
      return { style: 'bodySmall', color: '' }
    case 'HEADER':
      return { style: 'bodyNormalSemibold', color: '' }
    case 'TAG':
      return { style: 'BodySmall', color: 'grey' }
    default:
      return { style: 'bodyNormal', color: '' }
  }
}

export const menuAction = action => {
  switch (action.type) {
    case 'RESOURCE':
      return { text: '', onClick: () => console.log('RESOURCE ') }
    case 'LOCATION':
      return { text: '', onClick: () => console.log('LOCATION') }
    case 'ENTRY':
      return { text: '', onClick: () => console.log('ENTRY') }
    case 'NEW_ENTRY':
      return { text: '+', onClick: () => console.log('NEW_ENTRY') }
    case 'CLOSE':
      return { text: 'x', onClick: () => console.log('CLOSE') }
    case 'NEW_SOURCE':
      return { text: '@', onClick: () => console.log('NEW_SOURCE') }
    case 'NEW_LOCATION':
      return { text: '//', onClick: () => console.log('NEW_LOCATION ') }
    default:
      return { text: '', onClick: () => console.log('none') }
  }
}

export function htmlParser(htmlState) {
  const data = { ...htmlState }
  data.rawText = htmlToText(htmlState.html)
  return data
}

export const removeBlock = ({ blocks, index }) => {
  if (blocks.length === 1) {
    console.log('one block')
    return blocks
  }
  const newBlocks = blocks.slice(0)
  console.log(newBlocks)
  newBlocks.splice(index, 1)
  /*
    let newBlocks = blocksCopy.filter(b => b.index !== index)
    */
  console.log(newBlocks)
  /*
    newBlocks = newBlocks.map((b, i) => {
      console.log(b.ref)
      console.log(b.index)
      return { ...b, index: i }
    })
    */
  return newBlocks
}

export const appendBlock = ({ blocks, index, addNewBlock }) => {
  let { type, rawText, html, ref } = blocks[index]
  if (type === 'RESOURCE') {
    if (rawText[0] === '@') {
      html = html.substr(1)
      rawText = rawText.substr(1)
    }
    html = htmlToText(html)
  }
  if (type === 'TAG') {
    if (rawText[0] === '#') {
      html = html.substr(2)
      rawText = rawText.substr(2)
    }
    html = htmlToText(html)
  }
  if (type === 'LOCATION') {
    if (rawText[0] === '/') {
      html = html.substr(2)
      rawText = rawText.substr(2)
    }
    html = htmlToText(html)
  }
  if (type === 'HEADER') {
    if (rawText[0] === '#') {
      html = html.substr(1)
      rawText = rawText.substr(1)
    }
    html = htmlToText(html)
  }
  if (type === '') {
    rawText = rawText.trim()
    html = rawText.replace(/[\n\r]/, '<br>')
  }

  let newBlocks = [...blocks]

  const newBlock = {
    html,
    rawText,
    source: { name: '' },
    type,
    ref,
    index: blocks[index].index,
  }

  newBlocks[index] = newBlock

  if (addNewBlock) {
    newBlocks = newBlocks.concat(emptyBlock)
  }

  return newBlocks
}

/*
    Used to convert HTML text with <br> or other line
    breaks into a text string with new-line characters.
  */
function htmlToText(value) {
  // Convert `&amp;` to `&`.
  value = value.replace(/&amp;/gi, '&')

  // Replace spaces.
  value = value.replace(/&nbsp;/gi, ' ')
  value = value.replace(/\s+/g, ' ')

  // Remove "<b>".
  value = value.replace(/<b>/gi, '')
  value = value.replace(/<\/b>/gi, '')

  // Remove "<strong>".
  value = value.replace(/<strong>/gi, '')
  value = value.replace(/<\/strong>/gi, '')

  // Remove "<i>".
  value = value.replace(/<i>/gi, '')
  value = value.replace(/<\/i>/gi, '')

  // Remove "<em>".
  value = value.replace(/<em>/gi, '')
  value = value.replace(/<\/em>/gi, '')

  // Remove "<u>".
  value = value.replace(/<u>/gi, '')
  value = value.replace(/<\/u>/gi, '')

  // Tighten up "<" and ">".
  value = value.replace(/>\s+/g, '>')
  value = value.replace(/\s+</g, '<')

  // Replace "<br>".
  value = value.replace(/<br>/gi, '\n')

  // Replace "<div>" (from Chrome).
  value = value.replace(/<div>/gi, '\n')
  value = value.replace(/<\/div>/gi, '')

  // Replace "<p>" (from IE).
  value = value.replace(/<p>/gi, '\n')
  value = value.replace(/<\/p>/gi, '')

  // No more than 2x newline, per "paragraph".
  value = value.replace(/\n\n+/g, '\n\n')

  // Whitespace before/after.
  value = value.trim()

  return value
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
