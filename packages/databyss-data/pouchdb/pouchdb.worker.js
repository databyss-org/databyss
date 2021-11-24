/* eslint-disable no-restricted-globals */

// worker-side code
const registerWorkerPouch = require('worker-pouch/worker')
const PouchDB = require('pouchdb')

// attach to global `self` object
registerWorkerPouch(self, PouchDB)
