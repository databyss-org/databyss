import PouchDB from 'pouchdb'

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
    console.log('[VouchDB] get', docId)
    return eapi.db.get(docId)
  }

  bulkGet(request: Parameters<typeof eapi.db.bulkGet>[0]) {
    return eapi.db.bulkGet(request)
  }

  find(request: PouchDB.Find.FindRequest<any>) {
    return eapi.db.find(request)
  }

  upsert(...params: Parameters<typeof eapi.db.upsert>) {
    return eapi.db.upsert(...params)
  }
}
interface VouchDbRef {
  current: VouchDb | null
}

export const vouchDbRef: VouchDbRef = {
  current: null,
}

export const connect = () => {
  vouchDbRef.current = new VouchDb()
}
