import { createRxDatabase, addRxPlugin } from 'rxdb'

addRxPlugin(require('pouchdb-adapter-indexeddb'))

interface CreateOptions {
  name: string
}

export default (options: CreateOptions) =>
  createRxDatabase({
    name: options.name,
    adapter: 'indexeddb',
  })
