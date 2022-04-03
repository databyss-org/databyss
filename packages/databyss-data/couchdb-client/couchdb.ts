import { ResourceNotFoundError } from '@databyss-org/services/interfaces'
import {
  couchGet,
  couchPost,
  couchPut,
  RequestCouchOptions,
} from '@databyss-org/services/lib/requestCouch'

export class CouchDb {
  dbName: string

  constructor(dbName: string) {
    this.dbName = dbName
  }

  async allDocs(
    request: { keys: string[] },
    options?: RequestCouchOptions
  ): Promise<{ rows: { doc: any }[] } | null> {
    const response = await this.bulkGet(
      { docs: request.keys.map((id) => ({ id })) },
      options
    )
    if (!response) {
      return null
    }
    return {
      rows: response.results.map((r) => ({ doc: r.docs[0].ok })),
    }
  }

  get(docId: string, options?: RequestCouchOptions) {
    return couchGet(`${this.dbName}/${docId}`, options)
  }

  async bulkGet(
    request: { docs: { id: string }[] },
    options?: RequestCouchOptions
  ): Promise<{ results: { docs: { ok: any }[] }[] } | null> {
    return couchPost(`${this.dbName}/_bulk_get`, request, options) as Promise<{
      results: any[]
    }>
  }

  // TODO: add TS defs for find request
  find(request: any, options?: RequestCouchOptions) {
    return couchPost(`${this.dbName}/_find`, request, options)
  }

  // TODO: add TS defs for upsert request
  async upsert(
    docId: string,
    diffFn: (oldDoc: any) => any,
    options?: RequestCouchOptions
  ) {
    let _oldDoc = {}
    try {
      _oldDoc = (await this.get(docId, options)) as {}
    } catch (err) {
      if (!(err instanceof ResourceNotFoundError)) {
        throw err
      }
    }
    const _nextDoc = diffFn(_oldDoc)
    return couchPut(`${this.dbName}/${docId}`, _nextDoc, options)
  }
}
interface CouchDbRef {
  current: CouchDb | null
}

export const couchDbRef: CouchDbRef = {
  current: null,
}

export const connect = (dbName: string) => {
  couchDbRef.current = new CouchDb(dbName)
}
