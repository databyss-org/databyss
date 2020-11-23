import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb'
import { GroupCollection, GroupSchema } from '../schemas/group'

addRxPlugin(require('pouchdb-adapter-indexeddb'))

const DEFAULT_NAME = 'rxdb'

export type DatabyssCollections = {
  groups: GroupCollection
  // blocks: BlockCollection
}

export type DatabyssDatabase = RxDatabase<DatabyssCollections>

interface CreateOptions {
  name?: string
}

export const create = async (options: CreateOptions = {}) => {
  const db: DatabyssDatabase = await createRxDatabase({
    name: options.name || DEFAULT_NAME,
    adapter: 'indexeddb',
  })

  await db.collection({
    name: 'groups',
    schema: GroupSchema,
  })
  return db
}
