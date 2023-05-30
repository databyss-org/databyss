import { DocumentDict } from '@databyss-org/services/interfaces'
import { getPouchSecret } from '@databyss-org/services/session/clientStorage'
import { Base64 } from 'js-base64'
import { QueryClient } from '@tanstack/react-query'
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
  // console.log('[processChange]', _selectorKeys, nextDoc)
  if (!_selectorKeys.length) {
    return
  }
  _selectorKeys.forEach((_key) => {
    queryClient.setQueryData([selectors[_key]], (docs: DocumentDict<any>) => {
      const _docs = { ...(docs ?? {}) }
      if (nextDoc._deleted) {
        delete _docs[nextDoc._id]
      } else {
        _docs[nextDoc._id] = nextDoc
      }
      return _docs
    })
    if (nextDoc._deleted) {
      queryClient.removeQueries([`useDocument_${nextDoc._id}`])
    } else {
      queryClient.setQueryData([`useDocument_${nextDoc._id}`], nextDoc)
    }
    // query key is source doc id for useBibliography
    if (nextDoc._deleted) {
      queryClient.removeQueries([nextDoc._id])
    } else {
      queryClient.setQueryData([nextDoc._id], (docs: DocumentDict<any>) => ({
        ...(docs ?? {}),
        [nextDoc._id]: nextDoc,
      }))
    }
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
  let _headers = {}
  const _secrets = getPouchSecret()
  if (_secrets && groupId && _secrets[groupId]) {
    _headers = {
      Authorization: `Basic ${Base64.btoa(
        `${_secrets[groupId].dbKey}:${_secrets[groupId].dbPassword}`
      )}`,
    }
  }

  const cr = new ChangesReader(
    groupId,
    `https://${process.env.CLOUDANT_HOST}`,
    _headers
  )
  cr.start({ includeDocs: true })
    .on('change', (change) => {
      processChange({ queryClient, nextDoc: change.doc as DbDocument })
    })
    .on('error', (e) => {
      console.error('[ChangeResponder] error', e)
      if (e.statusCode === 403 || e.statusCode === 401) {
        // unauthorized, redirect to root
        window.location.href = '/'
      }
    })
}
