import { Workbox } from 'workbox-window'

export function register() {
  if ('serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`
    const wb = new Workbox(swUrl)

    wb.register()

    navigator.serviceWorker.ready.then(() => {
      console.log('Service worker ready...')
    })

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log(`New content is available!`)
      }
    })
  }
}
