/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching'

/*
// Detailed logging is very useful during development
workbox.setConfig({ debug: true })

// Updating SW lifecycle to update the app after user triggered refresh
workbox.core.skipWaiting()
workbox.core.clientsClaim()

// We inject manifest here using "workbox-build" in workbox-build-inject.js
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)
*/

precacheAndRoute(self.__WB_MANIFEST)
