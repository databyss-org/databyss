import { DocumentDict } from '@databyss-org/services/interfaces'
import { QueryClient } from 'react-query'
import { DbDocument } from '../pouchdb/interfaces'
import { getSelectorsForDoc, selectors } from '../pouchdb/selectors'
import { ChangesReader } from './ChangesReader'

export interface Change {
  id: string
  seq: string
  doc: DbDocument
}

export function processChange({
  queryClient,
  nextDoc,
}: {
  queryClient: QueryClient
  nextDoc: DbDocument
}) {
  const _selectorKeys = getSelectorsForDoc(nextDoc)
  if (!_selectorKeys.length) {
    return
  }
  _selectorKeys.forEach((_key) => {
    queryClient.setQueryData([selectors[_key]], (docs: DocumentDict<any>) => ({
      ...(docs ?? {}),
      [nextDoc._id]: nextDoc,
    }))
    queryClient.setQueryData(`useDocument_${nextDoc._id}`, nextDoc)
  })
}

export function initChangeResponder({
  queryClient,
  groupId,
}: {
  queryClient: QueryClient
  groupId: string
}) {
  console.log('[initChangeResponder]', groupId)
  // follow(
  //   {
  //     db: `https://${process.env.CLOUDANT_HOST}/${groupId}`,
  //     include_docs: true,
  //     since: 'now',
  //   },
  //   (error, change) => {
  //     if (error) {
  //       console.error('[ChangeResponder] error', error)
  //       return
  //     }
  //     console.log('[ChangeResponder] change', change)
  //   }
  // )

  const cr = new ChangesReader(groupId, `https://${process.env.CLOUDANT_HOST}`)
  cr.start({ includeDocs: true })
    .on('change', (change) => {
      processChange({ queryClient, nextDoc: change.doc as _Document })
    })
    // .on('batch', (b) => {
    //   console.log('[ChangeResponder] batch', b)
    // })
    // .on('seq', (s) => {
    //   console.log('[ChangeResponder] sequence token', s)
    // })
    .on('error', (e) => {
      console.error('[ChangeResponder] error', e)
    })
}
