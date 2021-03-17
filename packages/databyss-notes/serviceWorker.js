import { Workbox } from 'workbox-window'

export const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`
export const workbox = new Workbox(swUrl)
export const registrationRef = {
  current: null,
}

export function register() {
  if ('serviceWorker' in navigator) {
    workbox.register().then((reg) => {
      registrationRef.current = reg
    })
  }
}
