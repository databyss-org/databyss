import { Block, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlocks = (blockType: BlockType, includeIds?: string[]) => {
  const queryKey = `blocks_${blockType}`
  const query = useDocuments<Block>(queryKey, {
    $type: DocumentType.Block,
    type: blockType,
    ...(includeIds
      ? {
          _id: { $in: includeIds },
        }
      : {}),
  })
  return query
}
