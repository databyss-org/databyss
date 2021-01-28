import { useState, useEffect, useRef } from 'react'
import {
  BlockType,
  BlockRelation,
  ResourceResponse,
  ResourcePending,
} from '@databyss-org/services/interfaces'
import { resourceIsReady } from '@databyss-org/services/lib/util'
import { dbRef } from '../db'
import { DocumentType } from '../interfaces'

export const useBlockRelations = (
  blockType: BlockType
): BlockRelation[] | null => {
  const [, setState] = useState<ResourceResponse<BlockRelation[]>>(null)
  const docsRef = useRef<ResourceResponse<BlockRelation[]>>(null)

  const setDocs = (docs: ResourceResponse<BlockRelation[]>) => {
    docsRef.current = docs
    setState(docs)
  }

  // refresh fn
  const _refresh = () =>
    dbRef.current
      .find({
        selector: {
          $type: DocumentType.BlockRelation,
          relatedBlockType: blockType,
        },
      })
      .then((res) => setDocs(res.docs))
      .catch((err) => setDocs(err))

  useEffect(() => {
    const _changes = dbRef.current
      .changes({
        since: 'now',
        live: true,
      })
      .on('change', (change) => {
        console.log('useBlockRelations.change', change)
        if (!resourceIsReady(docsRef.current)) {
          console.log(
            'Warning: change event triggered before resources finished loading'
          )
          return
        }
        if (
          change.deleted ||
          !(docsRef.current as BlockRelation[]).find((d) => d._id === change.id)
        ) {
          // doc was added or removed, refresh list
          _refresh()
        }
        // else doc was modified, do nothing
      })
    return () => {
      _changes.cancel()
    }
  }, [])
  if (resourceIsReady(docsRef.current)) {
    return docsRef.current as BlockRelation[]
  }
  if (docsRef.current instanceof ResourcePending) {
    return null
  }
  if (docsRef.current instanceof Error) {
    throw docsRef.current
  }
  _refresh()
  setDocs(new ResourcePending())
  return null
}
