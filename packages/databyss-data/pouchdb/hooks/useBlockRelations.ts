import { BlockRelation, BlockType } from '@databyss-org/services/interfaces'
import { DocumentType } from '../interfaces'
import { useDocuments } from './useDocuments'

export const useBlockRelations = (blockType: BlockType) => {
  const queryKey = `blockRelations_${blockType}`
  const query = useDocuments<BlockRelation>(queryKey, {
    $type: DocumentType.BlockRelation,
    relatedBlockType: blockType,
  })
  return query
}
