import { useState } from 'react'
import {
  BlockType,
  BlockRelation,
  ResourceResponse,
  ResourcePending,
} from '@databyss-org/services/interfaces'
import { dbRef } from '../db'
import { DocumentType } from '../interfaces'

export const useBlockRelations = (
  blockType: BlockType
): BlockRelation[] | null => {
  const [docs, setDocs] = useState<ResourceResponse<BlockRelation[]>>(null)
  if (docs && !(docs instanceof ResourcePending) && !(docs instanceof Error)) {
    return docs
  }
  if (docs instanceof ResourcePending) {
    return null
  }
  if (docs instanceof Error) {
    throw docs
  }
  dbRef.current
    .find({
      selector: {
        $type: DocumentType.BlockRelation,
        relatedBlockType: blockType,
      },
    })
    .then((res) => setDocs(res.docs))
    .catch((err) => setDocs(err))
  setDocs(new ResourcePending())
  return null
}
