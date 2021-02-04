import { BlockType, BlockRelation } from '@databyss-org/services/interfaces'
import { IncludeFromResultOptions } from '@databyss-org/data/pouchdb/hooks/useDocuments'
import { useBlockRelations, useBlocks } from './'

export const useRelatedBlocks = (
  blockType: BlockType,
  relatedBlockType: BlockType,
  relatedBlockId: string
) => {
  const blockRelationRes = useBlockRelations(relatedBlockType, {
    relatedBlock: relatedBlockId,
  })
  return useBlocks(blockType, {
    includeFromResults: {
      result: blockRelationRes,
      resultToBlockId: (doc) =>
        doc.relatedBlock === relatedBlockId && doc.block,
    } as IncludeFromResultOptions<BlockRelation>,
  })
}
