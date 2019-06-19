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
