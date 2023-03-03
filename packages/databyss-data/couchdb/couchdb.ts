import { stemmer as porterStemmer } from 'stemmer'
import { ResourceNotFoundError } from '@databyss-org/services/interfaces'
import { InvalidRequestError } from '@databyss-org/services/interfaces/Errors'
import {
  couchGet,
  couchPost,
  couchPut,
  RequestCouchOptions,
} from '@databyss-org/services/lib/requestCouch'
import { PouchDbSearchRow } from '../pouchdb/entries/lib/searchEntries'

export interface SearchTerm {
  text: string
  exact?: boolean
  stemmed?: boolean
  original: string
}

interface SplitSearchTermOptions {
  normalized: boolean
  stemmed: boolean
}

export function unorm(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function stemmer(word: string) {
  if (word.endsWith('ier')) {
    return word.substring(0, word.length - 2)
  }
  if (word.endsWith('iest')) {
    return word.substring(0, word.length - 3)
  }
  return porterStemmer(word)
}

export function splitSearchTerms(
  query: string,
  { stemmed, normalized }: SplitSearchTermOptions
) {
  const _words = query.split(' ')
  const _terms: SearchTerm[] = []
  let _widx = 0
  let _tidx = 0
  let _inphrase = false
  while (_widx < _words.length) {
    if (_inphrase) {
      _terms[_tidx].text += ` ${_words[_widx]}`
      if (_words[_widx].endsWith('"')) {
        _tidx += 1
        _inphrase = false
      }
    } else {
      _terms[_tidx] = {
        text: _words[_widx],
        original: _words[_widx].replaceAll('"', ''),
      }
      if (_words[_widx].startsWith('"')) {
        _terms[_tidx].exact = true
        _terms[_tidx].text = _terms[_tidx].text.substring(1)
        if (!_words[_widx].endsWith('"')) {
          _inphrase = true
        } else {
          _tidx += 1
        }
      } else {
        _tidx += 1
      }
    }
    // trim trailing quote
    const _lastTerm = _terms[_terms.length - 1]
    if (_lastTerm.text.endsWith('"')) {
      _lastTerm.text = _lastTerm.text.substring(0, _lastTerm.text.length - 1)
    }

    _widx += 1
  }

  const _additional: SearchTerm[] = []
  const _processed = _terms.map((term) => {
    if (term.exact) {
      return term
    }
    if (normalized) {
      // normalize diactritics
      term.text = unorm(term.text)
    }
    if (stemmed) {
      const _stem = stemmer(term.text)
      if (_stem.length > 2 && _stem !== term.text) {
        term.text = _stem
        term.stemmed = true
        if (term.text.endsWith('bl')) {
          _additional.push({
            original: term.original,
            text: `${term.text.substring(0, term.text.length - 1)}il`,
          })
        }
        if (term.text.endsWith('i')) {
          _additional.push({
            original: term.original,
            text: `${term.text.substring(0, term.text.length - 1)}y`,
          })
        }
      }
    }
    return term
  })

  return _processed.concat(_additional)
}

export class CouchDb {
  dbName: string

  constructor(dbName: string) {
    this.dbName = dbName
  }

  async allDocs(request: { keys: string[] }, options?: RequestCouchOptions) {
    return couchPost(`${this.dbName}/_all_docs`, request, {
      ...options,
      authenticateAsGroupId: this.dbName,
    }) as Promise<{ rows: { doc: any }[] } | null>
  }

  get(docId: string, options?: RequestCouchOptions) {
    return couchGet(`${this.dbName}/${docId}`, {
      ...options,
      authenticateAsGroupId: this.dbName,
    })
  }

  // async bulkGet(
  //   request: { docs: { id: string }[] },
  //   options?: RequestCouchOptions
  // ): Promise<{ results: { docs: { ok: any }[] }[] } | null> {
  //   return couchPost(`${this.dbName}/_bulk_get?revs=false`, request, {
  //     ...options,
  //     authenticateAsGroupId: this.dbName,
  //   }) as Promise<{
  //     results: any[]
  //   }>
  // }
  async bulkGet(
    request: { docs: { id: string }[] },
    options?: RequestCouchOptions
  ): Promise<{ results: { docs: { ok: any }[] }[] } | null> {
    const response = (await couchPost(
      `${this.dbName}/_all_docs`,
      {
        keys: request.docs.map(({ id }) => id),
        include_docs: true,
      },
      {
        ...options,
        authenticateAsGroupId: this.dbName,
      }
    )) as {
      rows: {
        id: string
        doc: any
      }[]
    }
    return {
      results: response.rows.map((r) => ({
        id: r.id,
        docs: [{ ok: r.doc }],
      })),
    }
  }

  // TODO: add TS defs for find request
  find(request: any, options?: RequestCouchOptions) {
    return couchPost(`${this.dbName}/_find`, request, {
      ...options,
      authenticateAsGroupId: this.dbName,
    })
  }

  // TODO: add TS defs for upsert request
  async upsert(
    docId: string,
    diffFn: (oldDoc: any) => any,
    options?: RequestCouchOptions
  ) {
    let _oldDoc = {}
    try {
      _oldDoc = (await this.get(docId, {
        ...options,
        authenticateAsGroupId: this.dbName,
      })) as {}
    } catch (err) {
      if (!(err instanceof ResourceNotFoundError)) {
        throw err
      }
    }
    const _nextDoc = diffFn(_oldDoc)
    return couchPut(`${this.dbName}/${docId}`, _nextDoc, {
      ...options,
      authenticateAsGroupId: this.dbName,
    })
  }

  /**
   * Fulltext search
   * @param query search string
   */
  async search(
    { query },
    options?: RequestCouchOptions
  ): Promise<PouchDbSearchRow[]> {
    const _terms = splitSearchTerms(query, {
      stemmed: false,
      normalized: true,
    })
    const body = {
      selector: {
        $and: _terms.map((term) => ({
          $text: term.text,
        })),
      },
    }
    const res: any = await couchPost(`${this.dbName}/_find`, body, {
      ...options,
      authenticateAsGroupId: this.dbName,
    })
    if (!res.docs) {
      throw new InvalidRequestError(`Invalid query: ${JSON.stringify(body)}`)
    }

    const nresq = encodeURIComponent(
      _terms.map((t) => `${t.text}*`).join(' AND ')
    )
    const nresuri = `${this.dbName}/_design/custom_search_index/_search/normalized?q=${nresq}&include_docs=true`
    // console.log('[CouchDB] search', nresuri)
    const nres: any = await couchGet(nresuri, {
      ...options,
      authenticateAsGroupId: this.dbName,
    })

    const rowDict: { [id: string]: PouchDbSearchRow } = {}
    res.docs.forEach((doc: any) => {
      if (rowDict[doc._id]) {
        return
      }
      const row: PouchDbSearchRow = {
        id: doc._id,
        doc,
        score: 0,
      }
      rowDict[doc._id] = row
    })
    nres.rows.forEach((row: any) => {
      if (rowDict[row.id]) {
        return
      }
      const _row: PouchDbSearchRow = {
        id: row.id,
        doc: row.doc,
        score: 0,
        normalized: true,
      }
      rowDict[row.id] = _row
    })

    return Object.values(rowDict)
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
