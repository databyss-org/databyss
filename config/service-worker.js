/* eslint-disable no-restricted-globals */
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

self.addEventListener('install', (event) => {
  console.log('install')
  event.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (event) => {
  console.log('active')
  event.waitUntil(self.clients.claim())
})

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler)
registerRoute(navigationRoute)
