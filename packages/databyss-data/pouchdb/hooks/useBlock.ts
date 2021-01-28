import { useState, useRef, useEffect } from 'react'
import {
  ResourceResponse,
  ResourcePending,
  Block,
} from '@databyss-org/services/interfaces'
import { resourceIsReady } from '@databyss-org/services/lib/util'
import { dbRef } from '../db'

export const useBlock = <blockType extends Block>(
  id: string
): blockType | null => {
  const [, setState] = useState<ResourceResponse<blockType>>(null)
  const docRef = useRef<ResourceResponse<blockType>>(null)

  const setDoc = (doc: ResourceResponse<blockType>) => {
    docRef.current = doc
    setState(doc)
  }

  const refresh = () =>
    dbRef.current
      .get(id)
      .then((res) => setDoc(res))
      .catch((err) => setDoc(err))

  useEffect(() => {
    if (!resourceIsReady(docRef.current)) {
      return () => null
    }
    const _changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
        doc_ids: [(docRef.current as blockType)._id],
      })
      .on('change', (change) => {
        console.log('useBlock.change', change)
        refresh()
      })
    return () => {
      _changes.cancel()
    }
  }, [docRef.current])

  if (resourceIsReady(docRef.current)) {
    return docRef.current as blockType
  }
  if (docRef.current instanceof ResourcePending) {
    return null
  }
  if (docRef.current instanceof Error) {
    throw docRef.current
  }
  refresh()
  setDoc(new ResourcePending())
  return null
}
