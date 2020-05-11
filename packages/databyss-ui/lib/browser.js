// from https://stackoverflow.com/a/32261263
// opens popup window in the center of the window passed as `win`
export const openPopupWindow = ({ url, name, win, w, h }) => {
  const y = win.top.outerHeight / 2 + win.top.screenY - h / 2
  const x = win.top.outerWidth / 2 + win.top.screenX - w / 2
  return win.open(
    url,
    name,
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
  )
}

// OAuth Popup window
// from: https://blog.leavemealone.app/how-to-oauth-popup/
let windowObjectReference = null
let previousUrl = null

export const openOauthWindow = ({ url, name }) => {
  const windowOptions = { url, name, win: window, w: 600, h: 650 }
  if (windowObjectReference === null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
     or if such pointer exists but the window was closed */
    windowObjectReference = openPopupWindow(windowOptions)
  } else if (previousUrl !== url) {
    /* if the resource to load is different,
     then we load it in the already opened secondary window and then
     we bring such window back on top/in front of its parent window. */
    windowObjectReference = openPopupWindow(windowOptions)
    windowObjectReference.focus()
  } else {
    /* else the window reference must exist and the window
     is not closed; therefore, we can bring it back on top of any other
     window with the focus() method. There would be no need to re-create
     the window or to reload the referenced resource. */
    windowObjectReference.focus()
  }

  // assign the previous URL
  previousUrl = url
}
