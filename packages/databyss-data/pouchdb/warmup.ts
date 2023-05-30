import PouchDB from 'pouchdb'
import { QueryClient } from '@tanstack/react-query'
import { getSelectorsForDoc, selectors } from './selectors'

export const initialCaches: any = {}

export async function warmupCaches(
  db: PouchDB.Database<any>,
  queryClient: QueryClient
) {
  initialCaches.warming = true
  const _docs = await db.allDocs({
    update_seq: true,
    include_docs: true,
  })

  // console.log('[warmupCaches] allDocs', _docs.total_rows)
  _docs.rows.forEach((_row) => {
    if (!_row.doc) {
      return
    }
    const _selectors = getSelectorsForDoc(_row.doc)
    _selectors.forEach((_key) => {
      if (!initialCaches[_key]) {
        initialCaches[_key] = {}
      }
      initialCaches[_key][_row.doc._id] = _row.doc
    })
  })
  // console.log('[warmupCaches] caches', initialCaches)
  Object.keys(initialCaches).forEach((_key) => {
    if (_key === 'warming') {
      return
    }
    queryClient.setQueryData([selectors[_key]], initialCaches[_key])
  })
  return _docs.update_seq!
}
