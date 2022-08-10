import { ResourceNotFoundError } from '@databyss-org/services/interfaces'
import { InvalidRequestError } from '@databyss-org/services/interfaces/Errors'
import {
  couchGet,
  couchPost,
  couchPut,
  RequestCouchOptions,
} from '@databyss-org/services/lib/requestCouch'
import { PouchDbSearchRow } from '../pouchdb/entries/lib/searchEntries'

function splitSearchTerms(query: string) {
  const _words = query.split(' ')
  const _terms: string[] = []
  let _widx = 0
  let _tidx = 0
  let _inphrase = false
  while (_widx < _words.length) {
    if (_inphrase) {
      _terms[_tidx] += ` ${_words[_widx]}`
      if (_words[_widx].endsWith('"')) {
        _terms[_tidx] = _terms[_tidx].substring(0, _terms[_tidx].length - 1)
        _tidx += 1
        _inphrase = false
      }
    } else {
      _terms[_tidx] = _words[_widx]
      if (_words[_widx].startsWith('"')) {
        _terms[_tidx] = _terms[_tidx].substring(1)
        _inphrase = true
      } else {
        _tidx += 1
      }
    }
    _widx += 1
  }
  return _terms
}

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

  /**
   * Fulltext search
   * @param query search string
   */
  async search(
    { query },
    options?: RequestCouchOptions
  ): Promise<PouchDbSearchRow[]> {
    const _terms = splitSearchTerms(query)
    console.log('[search] terms', _terms)
    const body = {
      selector: {
        $and: _terms.map((term) => ({
          $text: term,
        })),
      },
    }
    const res: any = await couchPost(`${this.dbName}/_find`, body, options)
    if (!res.docs) {
      throw new InvalidRequestError(`Invalid query: ${JSON.stringify(body)}`)
    }
    return res.docs.map((doc: any) => {
      const row: PouchDbSearchRow = {
        id: doc._id,
        doc,
        score: 0,
      }
      return row
    })
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
