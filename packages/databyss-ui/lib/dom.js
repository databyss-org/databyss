// HACK: fixScroll forces the window scroll back to zero
//  We call it on body-level touch events that might effect scroll as
// a last-resort fallback for when our other attempts to prevent window scrolling fail.
export const fixScroll = () => {
  if (document.body.scrollTop > 0) {
    window.requestAnimationFrame(() => {
      window.scroll(0, 0)
    })
  }
}
let fixScrollInterval = null
export const lockBodyScrollToTop = () => {
  // document.body.addEventListener('touchmove', fixScroll, false)
  // document.body.addEventListener('touchend', fixScroll, false)
  window.clearInterval(fixScrollInterval)
  fixScrollInterval = window.setInterval(fixScroll, 250)

  // this stops extra scroll at the end of the contentContainer
  // from scrolling the page (most of the time)
  document.body.style.overflow = 'hidden'
}

export const unlockBodyScroll = () => {
  document.body.style.overflow = 'auto'
  // document.body.removeEventListener('touchmove', fixScroll)
  // document.body.removeEventListener('touchend', fixScroll)
  window.clearInterval(fixScrollInterval)
}

export const raf = cb => window.requestAnimationFrame(cb)

export const getBodyScroll = () =>
  window.pageYOffset || document.documentElement.scrollTop
export const setBodyScroll = pos => {
  document.documentElement.scrollTop = pos
  document.body.scrollTop = pos
}

export const setElementDisplayNone = id => {
  const el = document.querySelectorAll(id)[0]
  const display = el.style.display
  el.style.display = 'none'
  return display
}

export const restoreElementDisplay = (id, display) => {
  const el = document.querySelectorAll(id)[0]
  el.style.display = display
}

export const scrollTo = scrollnumber =>
  window.requestAnimationFrame(() => {
    window.scrollTo(0, scrollnumber)
  })

export const triggerMouseEvent = (node, eventName) => {
  const evt = new MouseEvent(eventName, {
    bubbles: true,
    cancelable: true,
    view: window,
  })
  return node.dispatchEvent(evt)
}

export const idFromTitle = title => title.toLowerCase().replace(/[^a-z]/, '_')

export const getPosition = element => {
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
  } else if (sel === doc.selection && sel.type !== 'Control') {
    const textRange = sel.createRange()
    const preCaretTextRange = doc.body.createTextRange()
    preCaretTextRange.moveToElementText(element)
    preCaretTextRange.setEndPoint('EndToEnd', textRange)
    caretOffset = preCaretTextRange.text.length
  }
  return caretOffset
}

export const getInnerTextForBlock = id => {
  const el = document.getElementById(id)
  return el.innerText
}

// export const getSelectedId = e => {

//   try {
//     const _selection = e.target.getSelection()
//     const _el = _selection.focusNode.parentElement.closest('[data-byss-block]')
//     return _el.getAttribute('id')
//   } catch {
//     return null
//   }
// }

export const getSelectedId = e => {
  try {
    const _selection = e.target
    const _el = _selection.closest('[data-byss-block]')
    return _el.getAttribute('id')
  } catch {
    return null
  }
}

export const getCaretPosition = () => {
  const _selection = window.getSelection()
  try {
    const _el = _selection.focusNode.parentElement.closest('[data-byss-block]')
    return getPosition(_el)
  } catch {
    return 0
  }
}

export const setCaretPos = pos => {
  try {
    const _selection = window.getSelection()
    const _el = _selection.focusNode.parentElement.closest('[data-byss-block]')
    const range = document.createRange()
    const sel = window.getSelection()
    range.setStart(_el.childNodes[0], pos)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  } catch {
    console.log('no selection')
  }
}

export const inKeyWhitelist = e => {
  const whitelist = ['ArrowUp', 'ArrowDown', 'Shift', 'Meta']
  const inWhteList = whitelist.findIndex(w => w === e.key) > -1 ? true : false

  return inWhteList || e.ctrlKey || e.metaKey
}
