export default null

// import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb'
// import { RxDBReplicationPlugin } from 'rxdb/plugins/replication'
// import { GroupCollection, GroupSchema } from '../schemas/group'

// addRxPlugin(require('pouchdb-adapter-indexeddb'))

// addRxPlugin(require('pouchdb-adapter-http'))

// addRxPlugin(RxDBReplicationPlugin)

// const DEFAULT_NAME = 'rxdb'
// // const TEST_DBNAME = 'testdb'

// export type DatabyssCollections = {
//   groups: GroupCollection
//   // blocks: BlockCollection
// }

// export type DatabyssDatabase = RxDatabase<DatabyssCollections>

// interface CreateOptions {
//   name?: string
// }

// export const create = async (options: CreateOptions = {}) => {
//   const db: DatabyssDatabase = await createRxDatabase({
//     name: options.name || DEFAULT_NAME,
//     adapter: 'indexeddb',
//   })

//   const _groups = await db.collection({
//     name: 'groups',
//     schema: GroupSchema,
//     // sync: true,
//   })
//   _groups.sync({
//     remote: `http://localhost:5001/groups`,
//   })
//   return db
// }
