/* eslint-disable no-restricted-globals */
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerBoundToURL('/index.html', true)
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/oauth_google/],
})
registerRoute(navigationRoute)
