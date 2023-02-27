let token = null

self.addEventListener('message', (event) => {
  // event is an ExtendableMessageEvent object
  console.log(`[DW] message: ${event.data}`)
  if (typeof event.data === 'string' && event.data.startsWith('token:')) {
    token = event.data.substring('token:'.length)
  }
})

self.addEventListener('install', (event) => {
  console.log('DW:install', event)
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[DW] activate', event)
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', async (event) => {
  const request = event.request.clone()
  const { method, url } = event.request

  console.log('[DW] fetch', method, url)

  const _url = new URL(request.url)
  if (!_url.pathname.startsWith('/b/') || method !== 'GET') {
    return
  }

  event.respondWith(
    (async () => {
      switch (method) {
        case 'GET':
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
        default:
          return new Response('unsupported method', { status: 500 })
      }
    })()
  )
})
