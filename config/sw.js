/* eslint-disable no-restricted-globals */
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoieFBFT3FMWlZJWWdSIn0sImlhdCI6MTY3NzQ0NDM4MywiZXhwIjoxNzA5MDAxOTgzfQ.bxfHSiNSUsDO3EcAVFgpvbb9GW2XEAV6pFptpEEn77U'

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

registerRoute('/b/(.*)', ({ url, request }) => {
  console.log('[DW] GET', url)
  const _url = new URL(request.url)
  const _req = new Request(
    request.url.replace(_url.origin, 'https://drive.databyss.cloud'),
    {
      headers: request.headers,
    }
  )
  // (add authorization if we have it)
  if (token) {
    _req.headers.append('Authorization', `Bearer ${token}`)
  }
  return fetch(_req).catch((err) => console.warn(err))
})
