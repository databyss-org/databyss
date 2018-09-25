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
