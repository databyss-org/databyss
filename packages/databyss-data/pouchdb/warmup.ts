import PouchDB from 'pouchdb'
import { QueryClient } from 'react-query'
import { selectors } from './selectors'

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
    Object.keys(selectors).forEach((_key) => {
      if (!_row.doc) {
        return
      }
      const _selector = selectors[_key]
      if (_row.doc.doctype === _selector.doctype) {
        if (
          (!_selector.blockType && !_selector.type) ||
          (_selector.blockType && _row.doc.blockType === _selector.blockType) ||
          (_selector.type && _row.doc.type === _selector.type)
        ) {
          if (!initialCaches[_key]) {
            initialCaches[_key] = {}
          }
          initialCaches[_key][_row.id] = _row.doc
        }
      }
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
