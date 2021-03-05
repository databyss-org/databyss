import { ResourceNotFoundError } from '@databyss-org/services/interfaces'
import {
  couchGet,
  couchPost,
  couchPut,
  RequestCouchOptions,
} from '@databyss-org/services/lib/requestCouch'

interface CouchDbDict {
  [dbName: string]: CouchDb
}

export class CouchDb {
  dbName: string

  constructor(dbName: string) {
    this.dbName = dbName
  }

  get(docId: string, options?: RequestCouchOptions) {
    return couchGet(`${this.dbName}/${docId}`, options)
  }

  async bulkGet(
    docIds: string[],
    options?: RequestCouchOptions
  ): Promise<{ [docId: string]: any | null }> {
    const _body = { docs: docIds.map((id) => ({ id })) }
    const _res = (await couchPost(
      `${this.dbName}/_bulk_get`,
      _body,
      options
    )) as {
      results: any[]
    }
    return _res.results.reduce((accum, curr) => {
      if (curr.docs[0].error) {
        if (curr.docs[0].error.error !== 'not_found') {
          throw new Error(
            `_bulk_get docId ${curr.id}: ${curr.docs[0].error.error}`
          )
        }
        accum[curr.id] = null
      }
      accum[curr.id] = curr.docs[0].ok
      return accum
    }, {})
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
      _oldDoc = await this.get(docId, options)
    } catch (err) {
      if (!(err instanceof ResourceNotFoundError)) {
        throw err
      }
    }
    const _nextDoc = diffFn(_oldDoc)
    return couchPut(`${this.dbName}/${docId}`, _nextDoc, options)
  }
}

export const couchDbDict: CouchDbDict = {}

interface CouchDbRef {
  current: CouchDb | null
}

export const couchDbRef: CouchDbRef = {
  current: null,
}

export const connect = (dbName: string) => {
  couchDbDict[dbName] = new CouchDb(dbName)
  return couchDbDict[dbName]
}

export const connectDefault = (dbName: string) => {
  couchDbRef.current = connect(dbName)
}
