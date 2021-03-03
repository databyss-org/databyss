import {
  couchGet,
  couchPost,
  requestCouch,
  RequestCouchOptions,
} from '@databyss-org/services/lib/requestCouch'
import { getAccountFromLocation } from '@databyss-org/services/session/_helpers'

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

  find(selector: any, options?: RequestCouchOptions) {
    return couchPost(`${this.dbName}/_find`, { selector }, options)
  }
}

const _dbName = `g_${getAccountFromLocation()}`
export const couchDbDict: CouchDbDict = {
  [_dbName]: new CouchDb(_dbName),
}

export const couchDbRef = {
  current: couchDbDict[_dbName],
}

export const connect = (dbName: string) => {
  couchDbDict[dbName] = new CouchDb(dbName)
  return couchDbDict[dbName]
}

export const connectDefault = (dbName: string) => {
  couchDbRef.current = connect(dbName)
}
