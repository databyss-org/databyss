import { SearchRow } from '../pouchdb/entries/lib/searchEntries'
import { couchDbRef } from './couchdb'

export const searchText = async ({
  query,
  onUpdated,
  allowStale,
}: {
  query: string
  onUpdated: (res: SearchRow[]) => void
  allowStale: boolean
}) => {
  // calculate how strict we want the search to be

  // will require at least one word to be in the results
  const _queryLength = query.split(' ').length
  let _percentageToMatch = 1 / _queryLength
  _percentageToMatch = +_percentageToMatch.toFixed(3)
  _percentageToMatch *= 100
  _percentageToMatch = +_percentageToMatch.toFixed(0)

  const _params = {
    query,
    fields: ['text.textValue'],
    include_docs: true,
    filter: (doc: any) => doc.doctype === DocumentType.Block,
    mm: `${_percentageToMatch}%`,
  }

  const _res = await (dbRef.current as PouchDB.Database).search({
    ..._params,
    ...(allowStale
      ? {
          stale: 'ok',
        }
      : {}),
  })

  if (allowStale) {
    ;(dbRef.current as PouchDB.Database).search(_params).then(onUpdated)
  } else {
    onUpdated(_res)
  }

  return _res
}
