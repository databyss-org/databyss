import { Workbox } from 'workbox-window'

import { version } from '@databyss-org/services'

export const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`
export const workbox = new Workbox(swUrl)
export const registrationRef = {
  current: null,
}

export function register() {
  if ('serviceWorker' in navigator) {
    workbox.register().then((reg) => {
      console.log('workbox registered', reg)
      registrationRef.current = reg
    })
  }

  console.log('version', version)
}
