import PouchDB from 'pouchdb'
import { dbRef } from '../pouchdb/db'

// eslint-disable-next-line no-undef
declare const eapi: typeof import('../../databyss-desktop/src/eapi').default

export class VouchDb {
  // constructor() {}

  info() {
    return eapi.db.info()
  }

  allDocs() {
    return eapi.db.allDocs()
  }

  get(docId: string) {
    return eapi.db.get(docId)
  }

  put(docId: string) {
    return eapi.db.put(docId)
  }

  bulkGet(request: Parameters<typeof eapi.db.bulkGet>[0]) {
    return eapi.db.bulkGet(request)
  }

  bulkDocs(...args: Parameters<typeof eapi.db.bulkDocs>) {
    return eapi.db.bulkDocs(...args)
  }

  find(request: PouchDB.Find.FindRequest<any>) {
    return eapi.db.find(request)
  }

  upsert(id: string, doc: object) {
    return eapi.db.upsert(id, doc)
  }

  search(...args: Parameters<typeof eapi.db.search>) {
    // console.log('[VouchDB] search', args)
    return eapi.db.search(...args)
  }
}

export const connect = (groupId) => {
  dbRef.current = new VouchDb() as PouchDB.Database<any>
  dbRef.groupId = groupId
}
