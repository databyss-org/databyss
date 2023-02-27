import { Workbox } from 'workbox-window'

export const swUrl = `${process.env.PUBLIC_URL}/sw.js`
export const registrationRef = {
  current: null,
}

export function register() {
  if ('serviceWorker' in navigator) {
    const _workbox = new Workbox(swUrl)
    _workbox.register().then((reg) => {
      registrationRef.current = reg
    })
  }
}
