import { Block, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlocks = (blockType: BlockType) => {
  const queryKey = `blocks_${blockType}`
  const query = useDocuments<Block>(queryKey, {
    $type: DocumentType.Block,
    type: blockType,
  })
  return query
}
